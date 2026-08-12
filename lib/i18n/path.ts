import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

/** Build a locale-prefixed path, e.g. `/en/routines`. */
export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Swap the locale segment in a pathname, preserving the rest of the path. */
export function swapLocalePath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  // ["", "he", "routines"] or ["", "routines"]
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }
  const rest = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return localePath(nextLocale, rest === "/" ? "/" : rest);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const maybeLocale = pathname.split("/")[1];
  if (maybeLocale && isLocale(maybeLocale)) return maybeLocale;
  return defaultLocale;
}
