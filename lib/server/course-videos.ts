import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { tryPresignR2Get } from "@/lib/server/r2-presign";

/**
 * Gated video delivery for real (non-mock) external-course lessons.
 *
 * The R2 bucket stays private — nothing is served from a public object URL.
 * A logged-in-and-paid-only route
 * (`/api/v1/external-courses/[slug]/lessons/[lessonId]/playback-url`) mints
 * a short-lived URL for a native `<video>` element (which cannot send an
 * Authorization header):
 *
 * 1. Presigned R2 GET when API credentials exist (the Worker cannot proxy
 *    class-length MP4s — that is Cloudflare 1102).
 * 2. HMAC `/stream` fallback, which 302s to a presigned URL when possible.
 */

// Long enough to cover one uninterrupted watch session without forcing a
// re-fetch mid-video; short enough that a leaked link doesn't stay valid
// indefinitely. This is access control tied to being logged in, not DRM —
// a signed link is usable by whoever holds it until it expires.
const PLAYBACK_URL_TTL_SECONDS = 4 * 60 * 60;

export async function getCourseVideosBucket(): Promise<R2Bucket | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.COURSE_VIDEOS ?? null;
  } catch (error) {
    console.error(
      "Failed to resolve Cloudflare context for the COURSE_VIDEOS binding:",
      error,
    );
    return null;
  }
}

export async function getVideoSigningKey(): Promise<CryptoKey> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.VIDEO_SIGNING_SECRET;
  if (!secret) {
    throw new Error("VIDEO_SIGNING_SECRET is not configured");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function buildSignaturePayload(
  courseSlug: string,
  lessonId: string,
  expiresAt: number,
): string {
  return `${courseSlug}:${lessonId}:${expiresAt}`;
}

export interface SignedLessonPlaybackUrl {
  url: string;
  expiresAt: number;
}

export async function signLessonPlaybackUrl(
  courseSlug: string,
  lessonId: string,
  r2Key: string,
): Promise<SignedLessonPlaybackUrl> {
  const expiresAt = Math.floor(Date.now() / 1000) + PLAYBACK_URL_TTL_SECONDS;
  const presigned = await tryPresignR2Get(r2Key, PLAYBACK_URL_TTL_SECONDS);
  if (presigned) {
    return { url: presigned, expiresAt };
  }

  const key = await getVideoSigningKey();
  const payload = buildSignaturePayload(courseSlug, lessonId, expiresAt);
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const sig = Buffer.from(signatureBytes).toString("base64url");

  const url = `/api/v1/external-courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/stream?exp=${expiresAt}&sig=${sig}`;
  return { url, expiresAt };
}

export async function verifyLessonPlaybackSignature(
  courseSlug: string,
  lessonId: string,
  expiresAtRaw: string | null,
  sigRaw: string | null,
): Promise<boolean> {
  if (!expiresAtRaw || !sigRaw) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt < Math.floor(Date.now() / 1000)) return false;

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = Buffer.from(sigRaw, "base64url");
  } catch {
    return false;
  }

  const key = await getVideoSigningKey();
  const payload = buildSignaturePayload(courseSlug, lessonId, expiresAt);
  return crypto.subtle.verify(
    "HMAC",
    key,
    // Buffer's ArrayBufferLike backing (which admits SharedArrayBuffer)
    // doesn't structurally satisfy Web Crypto's stricter BufferSource
    // typing, even though this is always a real, non-shared ArrayBuffer
    // at runtime (Buffer.from never returns a SharedArrayBuffer view).
    signatureBytes as BufferSource,
    new TextEncoder().encode(payload),
  );
}

/** A single HTTP `Range: bytes=...` request, translated to R2's range option. */
export type ParsedByteRange = { offset: number; length?: number } | { suffix: number };

export function parseRangeHeader(header: string | null): ParsedByteRange | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (startStr === "" && endStr === "") return null;

  if (startStr === "") {
    // Suffix range, e.g. "bytes=-500" = last 500 bytes.
    return { suffix: Number(endStr) };
  }

  const offset = Number(startStr);
  if (endStr === "") return { offset };

  const end = Number(endStr);
  if (end < offset) return null;
  return { offset, length: end - offset + 1 };
}

/** R2's echoed range on a GET, or undefined when the binding omits it. */
export type EchoedR2Range =
  | { offset: number; length?: number }
  | { offset?: number; length: number }
  | { suffix: number };

/**
 * Byte window to advertise on a 206. Prefer R2's echoed range when present;
 * otherwise derive it from the request. Returns null for an unsatisfiable
 * range (HTTP 416). Always 206 when the client sent Range — a 200 on a
 * Range request makes Safari/Chrome media playback stutter or stall.
 */
export function describeR2VideoRange(
  requested: ParsedByteRange,
  objectSize: number,
  echoed?: EchoedR2Range,
): { start: number; end: number; length: number } | null {
  if (objectSize <= 0) return null;

  let start: number;
  let end: number;
  if (echoed && "suffix" in echoed) {
    start = Math.max(0, objectSize - echoed.suffix);
    end = objectSize - 1;
  } else if (echoed) {
    start = echoed.offset ?? 0;
    const length = echoed.length ?? objectSize - start;
    end = start + length - 1;
  } else if ("suffix" in requested) {
    start = Math.max(0, objectSize - requested.suffix);
    end = objectSize - 1;
  } else {
    start = requested.offset;
    const length = requested.length ?? objectSize - start;
    end = start + length - 1;
  }

  if (start < 0 || start >= objectSize) return null;
  end = Math.min(end, objectSize - 1);
  if (end < start) return null;
  return { start, end, length: end - start + 1 };
}

/** Uploads often land as octet-stream; browsers need video/mp4 to play. */
export function applyR2VideoContentType(headers: Headers): void {
  const contentType = headers.get("content-type");
  if (!contentType || contentType === "application/octet-stream") {
    headers.set("content-type", "video/mp4");
  }
}
