"use client";

import { useParams } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SettingsPanel } from "@/components/account/SettingsPanel";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

/** Profile + language/session settings on one page — not enough content to split. */
export default function AccountProfilePage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell
      title={dict.account.profile.title}
      subtitle={dict.account.profile.subtitle}
    >
      <div className="space-y-6">
        <ProfileForm labels={dict.account.profile} />
        <SettingsPanel
          labels={dict.account.settings}
          languageLabel={dict.nav.language}
        />
      </div>
    </AccountPageShell>
  );
}
