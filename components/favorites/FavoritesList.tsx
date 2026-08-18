"use client";

import { ArrowLeft } from "lucide-react";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { LibraryCard } from "@/components/routines/LibraryCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface FavoritesListProps {
  locale: Locale;
  labels: {
    loading: string;
    loggedOutTitle: string;
    loggedOutBody: string;
    loginCta: string;
    unavailable: string;
    empty: string;
    browseTutorials: string;
    viewRoutine: string;
    taughtBy: string;
    favoriteAdd: string;
    favoriteRemove: string;
    externalCourseTag: string;
    externalCourseCta: string;
  };
}

function StateBox({ children }: { children: React.ReactNode }) {
  return <Panel className="p-8 text-center">{children}</Panel>;
}

export function FavoritesList({ locale, labels }: FavoritesListProps) {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();

  if (!isConfigured) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.unavailable}</p>
      </StateBox>
    );
  }

  if (authLoading) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.loading}</p>
      </StateBox>
    );
  }

  if (!user) {
    return (
      <StateBox>
        <h2 className="font-display text-2xl font-bold text-white">
          {labels.loggedOutTitle}
        </h2>
        <p className="mt-2 text-frame-silver">{labels.loggedOutBody}</p>
        <Button href={localePath(locale, "/login")} className="group mt-5 py-2.5">
          {labels.loginCta}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Button>
      </StateBox>
    );
  }

  if (favoritesLoading) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.loading}</p>
      </StateBox>
    );
  }

  if (favorites.length === 0) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.empty}</p>
        <Button href={localePath(locale, "/routines")} className="group mt-5 py-2.5">
          {labels.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Button>
      </StateBox>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <li key={`${favorite.itemType}:${favorite.slug}`}>
          {favorite.itemType === "routine" ? (
            <RoutineCard
              routine={favorite.routine}
              locale={locale}
              labels={{
                viewRoutine: labels.viewRoutine,
                taughtBy: labels.taughtBy,
                favoriteAdd: labels.favoriteAdd,
                favoriteRemove: labels.favoriteRemove,
              }}
            />
          ) : (
            <LibraryCard
              href={localePath(locale, `/external-courses/${favorite.course.slug}`)}
              poster={favorite.course.coverImage}
              title={favorite.course.title}
              instructorName={favorite.course.provider}
              locale={locale}
              style={favorite.course.style}
              level={favorite.course.level}
              typeLabel={labels.externalCourseTag}
              priceDisplay={favorite.course.priceDisplay}
              cta={labels.externalCourseCta}
              taughtBy={labels.taughtBy}
              favorite={{
                item: {
                  itemType: "external_course",
                  slug: favorite.course.slug,
                  course: favorite.course,
                },
                add: labels.favoriteAdd,
                remove: labels.favoriteRemove,
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
