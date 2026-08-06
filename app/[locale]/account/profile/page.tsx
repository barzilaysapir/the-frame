"use client";

import { useParams } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function AccountProfilePage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell
      title={dict.account.profile.title}
      subtitle={dict.account.profile.subtitle}
    >
      <ProfileForm labels={dict.account.profile} />
    </AccountPageShell>
  );
}
