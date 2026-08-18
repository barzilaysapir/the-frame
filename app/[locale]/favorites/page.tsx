"use client";

import { useParams } from "next/navigation";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function FavoritesPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.favorites.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.favorites.subtitle}</p>
      </div>

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
    </main>
  );
}
