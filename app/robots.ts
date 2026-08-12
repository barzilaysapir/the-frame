import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated / user-specific pages have nothing worth indexing and are
      // either empty or a redirect-to-login for anonymous crawlers.
      disallow: ["/*/login", "/*/checkout", "/*/account", "/*/favorites"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
