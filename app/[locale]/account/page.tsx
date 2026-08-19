"use client";

import { useParams } from "next/navigation";
import { AccountLibrary } from "@/components/account/AccountLibrary";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function AccountLibraryPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell subtitle={dict.account.subtitle}>
      <AccountLibrary
        locale={locale}
        labels={{
          empty: dict.account.empty,
          loading: dict.account.loading,
          loadFailed: dict.account.loadFailed,
          browseTutorials: dict.common.browseTutorials,
          viewRoutine: dict.tutorials.viewRoutine,
          taughtBy: dict.tutorials.taughtBy,
          favoriteAdd: dict.tutorials.favoriteAdd,
          favoriteRemove: dict.tutorials.favoriteRemove,
          externalCourseTag: dict.externalCourses.tag,
          externalCourseCta: dict.externalCourses.cta,
        }}
      />
    </AccountPageShell>
  );
}
