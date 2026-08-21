/**
 * Browser gate for `/stream`: a cookie minted by the authenticated
 * `playback-url` route. `<video>` same-origin GETs send it; curl and a
 * shared URL on another device do not.
 *
 * Header-based hotlink checks (Referer / Sec-Fetch) broke playback — many
 * browsers omit those on media requests — so this cookie is the gate.
 */

export const PLAYBACK_GATE_COOKIE = "tf_pb";

const encoder = new TextEncoder();

export async function mintPlaybackGateValue(
  key: CryptoKey,
  expiresAt: number,
): Promise<string> {
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`pb:${expiresAt}`),
  );
  const sig = Buffer.from(signatureBytes).toString("base64url");
  return `${expiresAt}.${sig}`;
}

export async function verifyPlaybackGateValue(
  key: CryptoKey,
  raw: string | undefined,
): Promise<boolean> {
  if (!raw) return false;
  const dot = raw.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(raw.slice(0, dot));
  const sig = raw.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = Buffer.from(sig, "base64url");
  } catch {
    return false;
  }
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    encoder.encode(`pb:${expiresAt}`),
  );
}

export function playbackGateSetCookie(
  value: string,
  expiresAt: number,
  requestUrl: string,
): string {
  const maxAge = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
  let secure = false;
  try {
    secure = new URL(requestUrl).protocol === "https:";
  } catch {
    secure = true;
  }
  return `${PLAYBACK_GATE_COOKIE}=${value}; Path=/api/v1; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
