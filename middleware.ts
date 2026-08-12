import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isLocale,
  locales,
  LOCALE_PREF_COOKIE,
  LOCALE_PREF_COOKIE_MAX_AGE,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Edge Middleware (not proxy.ts): OpenNext Cloudflare 1.20.x does not support
 * Next.js 16 Node.js proxy yet. Keep locale redirects on the Edge runtime.
 */

// Default is always Hebrew. We only switch a first-time, no-preference
// visitor to English based on geo IP — never on Accept-Language, which is
// unreliable (browser/OS default, not the visitor's actual market).
const NON_DEFAULT_LOCALE: Locale = "en";

// Crawlers must always see the canonical default-locale (he) page for
// unprefixed paths, matching what's indexed via hreflang — geo-redirecting
// them would be cloaking, and could make bots (typically crawling from US
// IPs) skip Hebrew indexing entirely.
const BOT_USER_AGENT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|telegrambot|linkedinbot|twitterbot|discordbot|pinterest|embedly|quora link preview|outbrain|vkshare|redditbot|applebot|google-inspectiontool|adsbot/i;

function resolveLocaleFromCookieOrGeo(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_PREF_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const isBot = BOT_USER_AGENT_PATTERN.test(
    request.headers.get("user-agent") ?? "",
  );
  if (isBot) return defaultLocale;

  // Dual-platform on purpose: `cf-ipcountry` on Cloudflare Workers,
  // `x-vercel-ip-country` if this ever runs on Vercel — same code either way.
  const country =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country");

  if (country && country !== "IL") return NON_DEFAULT_LOCALE;
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameLocale) {
    // Already on a locale-prefixed path — sync the sticky cookie to match
    // so a manual language switch (or a D1-driven redirect for a logged-in
    // user) persists for the next bare-domain visit in this browser.
    if (request.cookies.get(LOCALE_PREF_COOKIE)?.value === pathnameLocale) {
      return NextResponse.next();
    }
    const response = NextResponse.next();
    response.cookies.set(LOCALE_PREF_COOKIE, pathnameLocale, {
      maxAge: LOCALE_PREF_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  const locale = resolveLocaleFromCookieOrGeo(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set(LOCALE_PREF_COOKIE, locale, {
    maxAge: LOCALE_PREF_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and metadata routes.
    "/((?!_next|.*\\..*|api|favicon.ico|robots.txt|sitemap.xml|icon.png).*)",
  ],
};
