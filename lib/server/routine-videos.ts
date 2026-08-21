import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { tryPresignR2Get } from "@/lib/server/r2-presign";

export {
  applyR2VideoContentType,
  describeR2VideoRange,
  getCourseVideosBucket as getRoutineVideosBucket,
  parseRangeHeader,
} from "@/lib/server/course-videos";

/**
 * Gated video delivery for routines (issue #232 — routine video used to be
 * a plain public URL with no auth/purchase check at all, unlike external
 * courses which already had a signed-URL + `hasPaidPurchase` gate).
 *
 * Mirrors `lib/server/course-videos.ts`'s pattern: a logged-in-and-paid-only
 * route (`/api/v1/routines/[slug]/playback-url`) mints a short-lived URL
 * for a native `<video>` element (which cannot send an Authorization
 * header). Real R2 keys use HMAC `/stream` by default; presigned R2 GET
 * only when `R2_PRESIGN_PLAYBACK=1`. Demo `https://` sources always use
 * `/stream`.
 *
 * Routines don't have their own R2 bucket/table the way external-course
 * lessons do (`external_course_lessons.r2_key`) — `routines.video_src` is
 * reused as the source: a private R2 object key in the shared
 * `COURSE_VIDEOS` bucket for real content, or a plain external URL for
 * demo/mock routines (see `lib/routines.ts`'s `SAMPLE_VIDEO_SRC`). The
 * streaming route below sniffs which one it's dealing with. A distinct
 * "routine:" payload prefix (vs. course-videos.ts's
 * `${courseSlug}:${lessonId}:${expiresAt}`) keeps a signature minted for
 * one content type from being replayable against the other, even though
 * they'd currently share `VIDEO_SIGNING_SECRET`.
 */

const PLAYBACK_URL_TTL_SECONDS = 4 * 60 * 60;

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

function buildSignaturePayload(routineSlug: string, expiresAt: number): string {
  return `routine:${routineSlug}:${expiresAt}`;
}

export interface SignedRoutinePlaybackUrl {
  url: string;
  expiresAt: number;
}

function isExternalUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export async function signRoutinePlaybackUrl(
  routineSlug: string,
  videoSrc: string,
): Promise<SignedRoutinePlaybackUrl> {
  const expiresAt = Math.floor(Date.now() / 1000) + PLAYBACK_URL_TTL_SECONDS;
  if (!isExternalUrl(videoSrc)) {
    const presigned = await tryPresignR2Get(videoSrc, PLAYBACK_URL_TTL_SECONDS);
    if (presigned) {
      return { url: presigned, expiresAt };
    }
  }

  const key = await getSigningKey();
  const payload = buildSignaturePayload(routineSlug, expiresAt);
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const sig = Buffer.from(signatureBytes).toString("base64url");

  const url = `/api/v1/routines/${encodeURIComponent(routineSlug)}/stream?exp=${expiresAt}&sig=${sig}`;
  return { url, expiresAt };
}

export async function verifyRoutinePlaybackSignature(
  routineSlug: string,
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
  const payload = buildSignaturePayload(routineSlug, expiresAt);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    new TextEncoder().encode(payload),
  );
}
