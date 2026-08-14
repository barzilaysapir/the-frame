import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Gated video delivery for real (non-mock) external-course lessons.
 *
 * The R2 bucket (`the-frame-class-videos`) stays private — nothing is ever
 * served from a public bucket URL. Instead: a logged-in-only route
 * (`/api/v1/external-courses/[slug]/lessons/[lessonId]/playback-url`) mints
 * a short-lived HMAC-signed URL pointing at the streaming route
 * (`.../stream`), which validates the signature (not a Firebase token —
 * a native <video> element can't send an Authorization header) and then
 * proxies the R2 object, honoring Range requests for seeking.
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

async function getSigningKey(): Promise<CryptoKey> {
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
): Promise<SignedLessonPlaybackUrl> {
  const key = await getSigningKey();
  const expiresAt = Math.floor(Date.now() / 1000) + PLAYBACK_URL_TTL_SECONDS;
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

  const key = await getSigningKey();
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
