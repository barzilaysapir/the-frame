import { WORKER_HOSTNAME, WORKER_ORIGIN } from "@/lib/site";

function cannotSendToUpay(url: URL): boolean {
  return url.protocol !== "https:" || url.hostname.toLowerCase() !== WORKER_HOSTNAME;
}

/**
 * uPay `wronginputreturnurl` rejects localhost and any host that is not
 * the production Worker. Preview aliases (`preview-the-frame…`) are a
 * different hostname — keep the path/query, move the origin.
 *
 * The live dashboard button leaves `returnurl` / `ipnurl` blank. Do not
 * turn a blank value into the Worker origin — that bounce is what uPay
 * reported as USER_NOT_EXISTS.
 */
export function rewriteUpayCallbackUrl(urlString: string): string {
  const trimmed = urlString.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
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
