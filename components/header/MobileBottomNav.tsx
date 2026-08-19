"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { getNavLinks, isNavPathActive } from "@/lib/nav-links";
import { NAV_ICONS } from "@/components/header/nav-icons";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  locale: Locale;
  labels: Dictionary["nav"];
}

const tabClassName =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors touch-manipulation";

/**
 * App-style fixed bottom tab bar, mobile only (`lg:hidden`). Primary
 * destinations live here (library/styles/teachers/about). Account entry is
 * the avatar dropdown in the top header — not a bottom tab.
 */
export function MobileBottomNav({ locale, labels }: MobileBottomNavProps) {
  const pathname = usePathname() || "";
  const tabs = getNavLinks(locale, labels);

  return (
    <nav
      aria-label={labels.primaryNavAria}
      className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-frame-border/80 bg-frame-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {tabs.map((tab) => {
        const active = isNavPathActive(pathname, locale, tab.matchPaths);
        const Icon = NAV_ICONS[tab.id];

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              tabClassName,
              active ? "text-frame-cyan" : "text-frame-muted hover:text-white",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
