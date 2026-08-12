"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

interface FavoriteItem {
  routineSlug: string;
  createdAt: string;
  routine: CatalogRoutine;
}

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  loading: boolean;
  isFavorited: (slug: string) => boolean;
  toggleFavorite: (routine: CatalogRoutine) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  loading: false,
  isFavorited: () => false,
  toggleFavorite: async () => {},
});

interface FavoritesSnapshot {
  uid: string;
  locale: Locale;
  items: FavoriteItem[];
}

export function FavoritesProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const { user } = useAuth();
  // `snapshot` only gets set from within the async fetch/mutation callbacks
  // below (never synchronously in the effect body), so whether it matches
  // the current uid+locale tells us if we're still loading — no separate
  // `loading` state to keep in sync.
  const [snapshot, setSnapshot] = useState<FavoritesSnapshot | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetchWithAuth(
          user,
          `/api/v1/me/favorites?locale=${locale}`,
        );
        if (!response.ok) {
          throw new Error(`favorites ${response.status}`);
        }
        const body = (await response.json()) as { items: FavoriteItem[] };
        if (!cancelled) {
          setSnapshot({ uid: user.uid, locale, items: body.items });
        }
      } catch {
        if (!cancelled) setSnapshot({ uid: user.uid, locale, items: [] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, locale]);

  const isCurrent = Boolean(
    user && snapshot && snapshot.uid === user.uid && snapshot.locale === locale,
  );
  // Memoized so it's referentially stable across renders where the
  // underlying snapshot hasn't changed — otherwise the `[]` fallback (and
  // `snapshot!.items`) would be a new array identity every render, defeating
  // the useCallback/useMemo hooks below that depend on it.
  const favorites = useMemo(
    () => (isCurrent ? snapshot!.items : []),
    [isCurrent, snapshot],
  );
  const loading = Boolean(user) && !isCurrent;

  const isFavorited = useCallback(
    (slug: string) => favorites.some((item) => item.routineSlug === slug),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (routine: CatalogRoutine) => {
      if (!user) return;
      const currentItems = favorites;
      const alreadyFavorited = currentItems.some(
        (item) => item.routineSlug === routine.slug,
      );
      const nextItems = alreadyFavorited
        ? currentItems.filter((item) => item.routineSlug !== routine.slug)
        : [
            ...currentItems,
            {
              routineSlug: routine.slug,
              createdAt: new Date().toISOString(),
              routine,
            },
          ];

      setSnapshot({ uid: user.uid, locale, items: nextItems });

      try {
        const response = alreadyFavorited
          ? await fetchWithAuth(user, `/api/v1/me/favorites/${routine.slug}`, {
              method: "DELETE",
            })
          : await fetchWithAuth(user, "/api/v1/me/favorites", {
              method: "POST",
              body: JSON.stringify({ routineSlug: routine.slug }),
            });
        if (!response.ok) throw new Error(`favorites toggle ${response.status}`);
      } catch {
        setSnapshot({ uid: user.uid, locale, items: currentItems });
      }
    },
    [user, locale, favorites],
  );

  const value = useMemo(
    () => ({ favorites, loading, isFavorited, toggleFavorite }),
    [favorites, loading, isFavorited, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
