/**
 * Public origin of the checkout request. uPay returnurl/ipnurl must hit
 * the host the buyer was actually on (workers.dev preview, production
 * workers.dev, or a custom domain). SITE_URL is a sitemap/metadata
 * fallback, not the callback host.
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
