/**
 * Canonical site URL, used for metadataBase, sitemap.xml, and robots.txt.
 * Falls back to a placeholder until a real production domain is wired up
 * via NEXT_PUBLIC_SITE_URL (set it once the site has a custom domain).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://theframebybarzilay.com";
