"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

export default function AccountLibraryPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell subtitle={dict.account.subtitle}>
      <div className="rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
        <p className="text-frame-silver">{dict.account.empty}</p>
        <Link
          href={localePath(locale, "/routines")}
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-neon-cta px-5 py-2.5 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {dict.common.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </AccountPageShell>
  );
}
