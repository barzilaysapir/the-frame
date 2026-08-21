import { SITE_URL, WORKER_ORIGIN } from "@/lib/site";

/**
 * Public origin of the incoming request. Used for logging/host detection.
 * uPay callbacks do not use this — they always go to WORKER_ORIGIN.
 */
export function publicOriginFromRequest(input: {
  url: string;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}): string {
  const url = new URL(input.url);
  const host = input.forwardedHost?.split(",")[0]?.trim() || url.host;
  const proto =
    input.forwardedProto?.split(",")[0]?.trim() ||
    url.protocol.replace(/:$/, "") ||
    "https";
  return `${proto}://${host}`;
}

export function isPublicHttpsOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".localhost")
    ) {
      return false;
    }
    if (
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return host.length > 0;
  } catch {
    return false;
  }
}

/**
 * Origin WhatsApp/Facebook should fetch `og:image` from. PR preview Workers
 * serve this branch's `/og/logo.jpg`; production 404s that file until merge.
 * Prefer the request host when it is a public https origin. Localhost falls
 * back to SITE_URL so `next dev` still emits an absolute URL.
 *
 * uPay must not use this — see `upayCallbackOrigin`.
 */
export function shareOriginFromHeaders(input: {
  host?: string | null;
  proto?: string | null;
}): string {
  const host = input.host?.split(",")[0]?.trim();
  if (!host) return SITE_URL.replace(/\/$/, "");
  const proto = input.proto?.split(",")[0]?.trim() || "https";
  const origin = `${proto}://${host}`.replace(/\/$/, "");
  const httpsOrigin = origin.replace(/^http:\/\//i, "https://");
  if (isPublicHttpsOrigin(httpsOrigin)) return httpsOrigin;
  return SITE_URL.replace(/\/$/, "");
}

/** uPay only gets the production Worker host — not preview aliases or localhost. */
export function upayCallbackOrigin(_requestOrigin?: string): string {
  return WORKER_ORIGIN;
}
