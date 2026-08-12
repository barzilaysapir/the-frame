"use client";

import { useParams } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { SettingsPanel } from "@/components/account/SettingsPanel";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function AccountSettingsPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell
      title={dict.account.settings.title}
      subtitle={dict.account.settings.subtitle}
    >
      <SettingsPanel
        labels={dict.account.settings}
        languageLabel={dict.nav.language}
      />
    </AccountPageShell>
  );
}
