import { isLocale } from "@/lib/i18n/config";
import { WORKER_ORIGIN } from "@/lib/site";

const DEFAULT_PAY_RETURN_PATH = "/he";

/**
 * Locale-prefixed in-app path only. Rejects protocol-relative URLs, `..`,
 * and anything that is not `/he` or `/en` (with an optional subpath).
 * uPay may glue `&errormessage=` onto the raw returnurl string (including
 * onto a hash) — cut at `&` / `?` / `#`.
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
  const cut = path.split("&")[0]?.split("?")[0]?.split("#")[0] ?? "";
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
 * uPay `returnurl` always lands on production. A new `/pay-return.html`
 * 404s there until this code is promoted to `main`, so we send the buyer
 * to the real course path with no extra query (unique `?payment=success`
 * was a cache miss that 1102'd).
 */
export function buildUpayBrowserReturnUrl(returnPath: string): string {
  const path = sanitizePayReturnPath(
    returnPath.startsWith("/") ? returnPath : DEFAULT_PAY_RETURN_PATH,
  );
  return `${WORKER_ORIGIN}${path}`;
}

export function buildUpayIpnUrl(purchaseId: string): string {
  return `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=${encodeURIComponent(purchaseId)}`;
}
