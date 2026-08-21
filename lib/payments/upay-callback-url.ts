import { isUnwiredPlaceholderOrigin, WORKER_ORIGIN } from "@/lib/site";

function cannotSendToUpay(url: URL): boolean {
  if (url.protocol !== "https:") return true;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost")
  ) {
    return true;
  }
  if (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    return true;
  }
  return isUnwiredPlaceholderOrigin(url.origin);
}

/**
 * uPay rejects loopback/http `returnurl` (`wronginputreturnurl`). Keep the
 * path and query, move the origin to the live Cloudflare Worker.
 */
export function rewriteUpayCallbackUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    if (!cannotSendToUpay(url)) return url.toString();
    return new URL(`${url.pathname}${url.search}${url.hash}`, WORKER_ORIGIN).toString();
  } catch {
    return `${WORKER_ORIGIN}/`;
  }
}

export function rewriteUpayFormFields(
  fields: Record<string, string>,
): Record<string, string> {
  const next = { ...fields };
  if (typeof next.returnurl === "string") {
    next.returnurl = rewriteUpayCallbackUrl(next.returnurl);
  }
  if (typeof next.ipnurl === "string") {
    next.ipnurl = rewriteUpayCallbackUrl(next.ipnurl);
  }
  return next;
}
