import { WORKER_ORIGIN } from "@/lib/site";

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

/** uPay only gets the production Worker host — not preview aliases or localhost. */
export function upayCallbackOrigin(_requestOrigin?: string): string {
  return WORKER_ORIGIN;
}
