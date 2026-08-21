import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Short-lived S3 SigV4 GET URLs for private R2 objects.
 *
 * The Worker binding (`COURSE_VIDEOS`) can only be read from Worker code —
 * a browser `<video>` cannot use it. Class-length MP4s must never be
 * proxied through `/stream` (Cloudflare error 1102). The player keeps a
 * same-origin `/stream` src; that route 307s to a presigned GET. Putting
 * the R2 URL on `<video src>` directly is a CORS footgun when bucket CORS
 * is missing.
 *
 * Requires an R2 S3 API token (`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`).
 * Account + bucket default to wrangler.jsonc (`the-frame` on this account).
 * Apply `r2-cors.json` on the bucket so Range GETs from the site origin
 * are allowed: `npx wrangler r2 bucket cors set the-frame --file r2-cors.json`.
 * Secrets are per Worker name — a PR preview is not `the-frame`.
 */

export const R2_DEFAULT_ACCOUNT_ID = "8541729902392a145a03f97a906af16f";
export const R2_DEFAULT_BUCKET = "the-frame";
export const R2_S3_REGION = "auto";
export const R2_S3_SERVICE = "s3";

export interface R2PresignConfig {
  accessKeyId: string;
  secretAccessKey: string;
  accountId: string;
  bucket: string;
}

export interface R2PresignEnv {
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ACCOUNT_ID?: string;
  R2_BUCKET_NAME?: string;
  R2_PRESIGN_PLAYBACK?: string;
  VIDEO_SIGNING_SECRET?: string;
}

export interface PlaybackStorageStatus {
  r2ApiConfigured: boolean;
  r2PresignEnabled: boolean;
  videoSigningConfigured: boolean;
}

function isR2PresignPlaybackEnabled(env: R2PresignEnv): boolean {
  return env.R2_PRESIGN_PLAYBACK?.trim() !== "0";
}

export function playbackStorageStatus(env: R2PresignEnv): PlaybackStorageStatus {
  return {
    r2ApiConfigured: readR2PresignConfig(env) !== null,
    r2PresignEnabled: isR2PresignPlaybackEnabled(env),
    videoSigningConfigured: Boolean(env.VIDEO_SIGNING_SECRET?.trim()),
  };
}

export function canPresignR2Playback(status: PlaybackStorageStatus): boolean {
  return status.r2ApiConfigured && status.r2PresignEnabled;
}

export async function readPlaybackStorageStatus(): Promise<PlaybackStorageStatus> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return playbackStorageStatus(env);
  } catch {
    return playbackStorageStatus({});
  }
}

export function readR2PresignConfig(env: R2PresignEnv): R2PresignConfig | null {
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) return null;
  return {
    accessKeyId,
    secretAccessKey,
    accountId: env.R2_ACCOUNT_ID?.trim() || R2_DEFAULT_ACCOUNT_ID,
    bucket: env.R2_BUCKET_NAME?.trim() || R2_DEFAULT_BUCKET,
  };
}

/** AWS SigV4 URI encode. `encodeSlash: false` keeps `/` as a path separator. */
export function awsUriEncode(value: string, encodeSlash = true): string {
  const bytes = new TextEncoder().encode(value);
  let out = "";
  for (const byte of bytes) {
    const char = String.fromCharCode(byte);
    if (
      (char >= "A" && char <= "Z") ||
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === "-" ||
      char === "_" ||
      char === "." ||
      char === "~" ||
      (char === "/" && !encodeSlash)
    ) {
      out += char;
    } else {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return out;
}

export function r2ObjectUrl(config: R2PresignConfig, objectKey: string): string {
  const key = objectKey.replace(/^\/+/, "");
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
}

export interface SignAws4QueryGetInput {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  host: string;
  canonicalUri: string;
  expiresInSeconds: number;
  now: Date;
}

/**
 * Query-string SigV4 for a GET with only `host` signed — extra headers
 * (Accept, Content-Type) would 403 in the browser, which does not send them.
 */
export async function signAws4QueryGet(
  input: SignAws4QueryGetInput,
): Promise<URLSearchParams> {
  const amzDate = toAmzDate(input.now);
  const dateStamp = amzDate.slice(0, 8);
  const credential = `${input.accessKeyId}/${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const query = new URLSearchParams();
  query.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  query.set("X-Amz-Credential", credential);
  query.set("X-Amz-Date", amzDate);
  query.set("X-Amz-Expires", String(input.expiresInSeconds));
  query.set("X-Amz-SignedHeaders", "host");

  const canonicalQuery = canonicalQueryString(query);
  const canonicalRequest = [
    "GET",
    input.canonicalUri,
    canonicalQuery,
    `host:${input.host}`,
    "",
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    `${dateStamp}/${input.region}/${input.service}/aws4_request`,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await deriveSigningKey(
    input.secretAccessKey,
    dateStamp,
    input.region,
    input.service,
  );
  const signature = toHex(await hmac(signingKey, stringToSign));
  query.set("X-Amz-Signature", signature);
  return query;
}

export async function presignR2GetUrl(
  config: R2PresignConfig,
  objectKey: string,
  expiresInSeconds: number,
  now = new Date(),
): Promise<string> {
  const key = objectKey.replace(/^\/+/, "");
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = awsUriEncode(`/${config.bucket}/${key}`, false);
  const query = await signAws4QueryGet({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: R2_S3_REGION,
    service: R2_S3_SERVICE,
    host,
    canonicalUri,
    expiresInSeconds,
    now,
  });
  return `https://${host}${canonicalUri}?${canonicalQueryString(query)}`;
}

export function remainingPlaybackTtlSeconds(expRaw: string | null): number {
  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return 60;
  return Math.max(30, exp - Math.floor(Date.now() / 1000));
}

export async function tryPresignR2Get(
  objectKey: string,
  expiresInSeconds: number,
): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!isR2PresignPlaybackEnabled(env)) return null;
    const config = readR2PresignConfig(env);
    if (!config) return null;
    return await presignR2GetUrl(config, objectKey, expiresInSeconds);
  } catch (error) {
    console.error("Failed to mint a presigned R2 GET URL:", error);
    return null;
  }
}

function canonicalQueryString(query: URLSearchParams): string {
  const pairs = [...query.entries()].map(
    ([name, value]) => `${awsUriEncode(name)}=${awsUriEncode(value)}`,
  );
  pairs.sort();
  return pairs.join("&");
}

function toAmzDate(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

async function deriveSigningKey(
  secret: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode(`AWS4${secret}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function hmac(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data),
  );
  return toHex(digest);
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
