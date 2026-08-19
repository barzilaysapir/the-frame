/**
 * Single source of truth for the primary site nav — shared by `Header` and
 * `MobileBottomNav` so desktop and mobile can't drift out of sync. Favorites
 * lives under the signed-in user menu (see `components/header/UserMenu.tsx`)
 * since it's a user-scoped page, not general marketing nav.
 */
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

export type NavLinkId = "tutorials" | "styles" | "teachers" | "about";

export interface NavLink {
  id: NavLinkId;
  label: string;
  href: string;
  /** Path prefixes (locale-stripped, leading slash) that count as this link being active. */
  matchPaths: string[];
}

export function getNavLinks(
  locale: Locale,
  labels: Dictionary["nav"],
): NavLink[] {
  return [
    {
      id: "tutorials",
      label: labels.tutorials,
      href: localePath(locale, "/routines"),
      matchPaths: ["/routines", "/routine", "/external-courses"],
    },
    {
      id: "styles",
      label: labels.styles,
      href: localePath(locale, "/styles"),
      matchPaths: ["/styles"],
    },
    {
      id: "teachers",
      label: labels.teachers,
      href: localePath(locale, "/instructors"),
      matchPaths: ["/instructors"],
    },
    {
      id: "about",
      label: labels.about,
      href: localePath(locale, "/about"),
      matchPaths: ["/about"],
    },
  ];
}

/** True when `pathname` is exactly one of `matchPaths` or nested under it (locale-aware). */
export function isNavPathActive(
  pathname: string,
  locale: Locale,
  matchPaths: string[],
): boolean {
  return matchPaths.some((path) => {
    const href = localePath(locale, path);
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}
