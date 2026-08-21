import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { shareOriginFromHeaders } from "@/lib/server/payments/checkout-origin";

/**
 * Request host for share-image URLs. Calling `headers()` opts metadata out of
 * prerender so OpenNext cannot bake production `SITE_URL` (where a new OG
 * asset 404s before merge) into the HTML WhatsApp fetches. Do not wrap this
 * in try/catch — a
 * fallback to `SITE_URL` is how preview shares previously still pointed at a
 * 404.
 */
export const resolveShareOrigin = cache(async (): Promise<string> => {
  const headerList = await headers();
  return shareOriginFromHeaders({
    host: headerList.get("x-forwarded-host") ?? headerList.get("host"),
    proto: headerList.get("x-forwarded-proto"),
  });
});
