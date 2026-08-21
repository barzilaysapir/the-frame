import {
  isUnwiredPlaceholderOrigin,
  WORKER_ORIGIN,
} from "@/lib/site";

/**
 * Public origin of the checkout request. uPay returnurl/ipnurl must be a
 * public https URL — `http://localhost:4127` is rejected as
 * `wronginputreturnurl`. Prefer the request host (preview/production
 * Worker), and fall back to the live Worker when the request is
 * loopback, private LAN, plain HTTP, or a domain that is not attached.
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

export function upayCallbackOrigin(requestOrigin: string): string {
  if (
    isPublicHttpsOrigin(requestOrigin) &&
    !isUnwiredPlaceholderOrigin(requestOrigin)
  ) {
    return requestOrigin.replace(/\/$/, "");
  }
  return WORKER_ORIGIN;
}
