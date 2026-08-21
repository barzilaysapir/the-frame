import { isLocale } from "@/lib/i18n/config";
import { WORKER_ORIGIN } from "@/lib/site";

/** Served from `public/` as a Static Asset — the Worker does not run. */
export const PAY_RETURN_FILE = "/pay-return.html";

const DEFAULT_PAY_RETURN_PATH = "/he";

/**
 * Locale-prefixed in-app path only. Rejects protocol-relative URLs, `..`,
 * and anything that is not `/he` or `/en` (with an optional subpath).
 */
export function sanitizePayReturnPath(raw: string): string {
  let path = raw.trim();
  try {
    if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(path) || path.startsWith("//")) {
      path = new URL(path, WORKER_ORIGIN).pathname;
    }
  } catch {
    return DEFAULT_PAY_RETURN_PATH;
  }
  const cut = path.split("?")[0]?.split("#")[0] ?? "";
  if (
    !cut.startsWith("/") ||
    cut.includes("//") ||
    cut.includes("\\") ||
    cut.includes("..")
  ) {
    return DEFAULT_PAY_RETURN_PATH;
  }
  const first = cut.split("/").filter(Boolean)[0];
  if (!first || !isLocale(first)) return DEFAULT_PAY_RETURN_PATH;
  return cut === `/${first}` || cut.startsWith(`/${first}/`)
    ? cut
    : DEFAULT_PAY_RETURN_PATH;
}

/**
 * uPay `returnurl` for the buyer’s browser. Destination is in both `next`
 * and the hash so a gateway that appends `?payment=success` or drops one
 * of them still has the other. The file is static — Cloudflare will not
 * invoke the Worker on this hop.
 */
export function buildUpayBrowserReturnUrl(returnPath: string): string {
  const path = sanitizePayReturnPath(
    returnPath.startsWith("/") ? returnPath : DEFAULT_PAY_RETURN_PATH,
  );
  return `${WORKER_ORIGIN}${PAY_RETURN_FILE}?next=${encodeURIComponent(path)}#${path}`;
}
