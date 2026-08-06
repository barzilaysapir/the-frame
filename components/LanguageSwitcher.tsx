"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { swapLocalePath } from "@/lib/i18n/path";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <div className="flex items-center gap-1" aria-label={label}>
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={swapLocalePath(pathname, item)}
            hrefLang={item}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-white/10 text-white"
                : "text-frame-muted hover:text-white"
            }`}
            aria-current={active ? "true" : undefined}
          >
            {localeNames[item]}
          </Link>
        );
      })}
    </div>
  );
}
