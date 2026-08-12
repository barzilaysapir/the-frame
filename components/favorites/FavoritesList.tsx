"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { useAuth } from "@/components/AuthProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
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
  };
}

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
      {children}
    </div>
  );
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
        <Link
          href={localePath(locale, "/login")}
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-neon-cta px-5 py-2.5 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {labels.loginCta}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Link>
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
        <Link
          href={localePath(locale, "/routines")}
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-neon-cta px-5 py-2.5 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {labels.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Link>
      </StateBox>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map(({ routineSlug, routine }) => (
        <li key={routineSlug}>
          <RoutineCard
            routine={routine}
            locale={locale}
            labels={{
              viewRoutine: labels.viewRoutine,
              taughtBy: labels.taughtBy,
              favoriteAdd: labels.favoriteAdd,
              favoriteRemove: labels.favoriteRemove,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
