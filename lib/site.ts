/**
 * Canonical site URL for metadataBase, sitemap.xml, robots.txt, and
 * uPay callbacks when the request itself is not a public https host
 * (local `next dev`).
 *
 * The app is on the Cloudflare Worker only. `theframe.bybarzilay.com`
 * is not attached yet (see wrangler.jsonc). Set NEXT_PUBLIC_SITE_URL
 * to that host after the custom domain is live. The old placeholder
 * `theframebybarzilay.com` is ignored if still present in an env var.
 */
export const WORKER_ORIGIN = "https://the-frame.barzilaysapir.workers.dev";

const UNWIRED_HOSTS = new Set([
  "theframebybarzilay.com",
  "www.theframebybarzilay.com",
]);

function configuredSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (UNWIRED_HOSTS.has(host)) return null;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".localhost")
    ) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export const SITE_URL = configuredSiteUrl() ?? WORKER_ORIGIN;

export function isUnwiredPlaceholderOrigin(origin: string): boolean {
  try {
    return UNWIRED_HOSTS.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}
