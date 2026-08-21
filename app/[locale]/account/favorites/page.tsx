"use client";

import { useParams } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function AccountFavoritesPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <AccountPageShell
      title={dict.favorites.title}
      subtitle={dict.favorites.subtitle}
    >
      <FavoritesList
        locale={locale}
        labels={{
          loading: dict.favorites.loading,
          loggedOutTitle: dict.favorites.loggedOutTitle,
          loggedOutBody: dict.favorites.loggedOutBody,
          loginCta: dict.favorites.loginCta,
          unavailable: dict.login.unavailable,
          empty: dict.favorites.empty,
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
