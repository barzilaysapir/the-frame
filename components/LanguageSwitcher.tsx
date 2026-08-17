"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { swapLocalePath } from "@/lib/i18n/path";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${locale}`;
  const { user } = useAuth();

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale || !user) return;
    // Fire-and-forget: persist the explicit choice to D1 so it's restored
    // on other devices/sessions too. Navigation isn't blocked on this.
    void fetchWithAuth(user, "/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify({ localePref: nextLocale }),
    }).catch(() => {});
  };

  return (
    <div className="flex items-center gap-1" aria-label={label}>
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={swapLocalePath(pathname, item)}
            hrefLang={item}
            onClick={() => handleSwitch(item)}
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
