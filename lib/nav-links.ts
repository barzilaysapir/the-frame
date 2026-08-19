/**
 * Single source of truth for the primary site nav — shared by `Header` and
 * `Footer` so the two can't drift out of sync (they did: the footer kept a
 * separately hand-maintained copy that missed Styles and Favorites once
 * those were added to the header). Favorites lives under the signed-in
 * user menu instead (see `components/header/UserMenu.tsx`) since it's a
 * user-scoped page, not general marketing nav.
 */
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

export interface NavLink {
  label: string;
  href: string;
}

export function getNavLinks(
  locale: Locale,
  labels: Dictionary["nav"],
): NavLink[] {
  return [
    { label: labels.tutorials, href: localePath(locale, "/routines") },
    { label: labels.styles, href: localePath(locale, "/styles") },
    { label: labels.teachers, href: localePath(locale, "/instructors") },
    { label: labels.about, href: localePath(locale, "/about") },
  ];
}
