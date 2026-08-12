export const locales = ["he", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "he";

export const localeNames: Record<Locale, string> = {
  he: "עברית",
  en: "English",
};

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Cookie that remembers the visitor's resolved locale — set whenever a
 * request lands on a locale-prefixed path (manual switch, D1-driven
 * redirect, or an earlier geo/default decision). Once present, middleware
 * trusts it over IP-based geo detection so the choice sticks for the rest
 * of the browser session.
 */
export const LOCALE_PREF_COOKIE = "locale_pref";
export const LOCALE_PREF_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
