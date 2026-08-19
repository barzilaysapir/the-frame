import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated / user-specific pages have nothing worth indexing and are
      // either empty or a redirect-to-login for anonymous crawlers. `/admin`
      // additionally has nothing anonymous crawlers should ever reach.
      // `/*/favorites` now just redirects into `/*/account`, already covered.
      disallow: ["/*/login", "/*/account", "/*/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
