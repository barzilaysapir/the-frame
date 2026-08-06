"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { isLocale } from "@/lib/i18n/config";
import {
  formatMessage,
  getDictionarySync,
} from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

export default function AccountPage() {
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
        {formatMessage(dict.account.greeting, { name: displayName })}
      </h1>
      <p className="mt-3 text-frame-silver">{dict.account.subtitle}</p>

      <div className="mt-10 rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
        <p className="text-frame-silver">{dict.account.empty}</p>
        <Link
          href={localePath(locale, "/routines")}
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-neon-cta px-5 py-2.5 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {dict.common.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
