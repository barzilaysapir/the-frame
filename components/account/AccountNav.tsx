"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

interface AccountNavLabels {
  library: string;
  favorites: string;
  profile: string;
  settings: string;
}

interface AccountNavProps {
  locale: Locale;
  labels: AccountNavLabels;
  ariaLabel: string;
}

const LINKS = [
  { key: "library" as const, path: "/account" },
  { key: "favorites" as const, path: "/account/favorites" },
  { key: "profile" as const, path: "/account/profile" },
  { key: "settings" as const, path: "/account/settings" },
];

export function AccountNav({ locale, labels, ariaLabel }: AccountNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      className="mb-8 flex flex-wrap gap-2 border-b border-frame-border pb-4"
    >
      {LINKS.map((link) => {
        const href = localePath(locale, link.path);
        const active =
          link.path === "/account"
            ? pathname === href || pathname === `${href}/`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={link.key}
            href={href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-frame-cyan/10 text-frame-cyan"
                : "text-frame-silver hover:bg-frame-panel hover:text-white",
            )}
          >
            {labels[link.key]}
          </Link>
        );
      })}
    </nav>
  );
}
