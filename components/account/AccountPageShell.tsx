"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AccountNav } from "@/components/account/AccountNav";
import { isLocale } from "@/lib/i18n/config";
import {
  formatMessage,
  getDictionarySync,
} from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

interface AccountPageShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AccountPageShell({
  children,
  title,
  subtitle,
}: AccountPageShellProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);
  const { user, loading, isConfigured } = useAuth();

  useEffect(() => {
    if (!isConfigured) return;
    if (!loading && !user) {
      router.replace(localePath(locale, "/login"));
    }
  }, [isConfigured, loading, user, router, locale]);

  if (!isConfigured) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-frame-silver">{dict.account.unavailable}</p>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-frame-silver">{dict.account.loading}</p>
      </main>
    );
  }

  const displayName =
    user.displayName ||
    user.phoneNumber ||
    user.email ||
    dict.account.fallbackName;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
        {title ?? formatMessage(dict.account.greeting, { name: displayName })}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-frame-silver">{subtitle}</p>
      ) : null}

      <div className="mt-8">
        <AccountNav
          locale={locale}
          labels={{
            library: dict.account.nav.library,
            profile: dict.account.nav.profile,
            settings: dict.account.nav.settings,
          }}
        />
      </div>

      {children}
    </main>
  );
}

export default AccountPageShell;
