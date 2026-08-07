"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { RoutineCard } from "@/components/RoutineCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

interface LibraryItem {
  purchaseId: string;
  paidAt: string | null;
  routine: CatalogRoutine;
}

interface AccountLibraryProps {
  locale: Locale;
  labels: {
    empty: string;
    loading: string;
    loadFailed: string;
    browseTutorials: string;
    viewRoutine: string;
    taughtBy: string;
  };
}

export function AccountLibrary({ locale, labels }: AccountLibraryProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetchWithAuth(
          user,
          `/api/v1/me/library?locale=${locale}`,
        );
        if (!response.ok) {
          throw new Error(`library ${response.status}`);
        }
        const body = (await response.json()) as { items: LibraryItem[] };
        if (!cancelled) {
          setItems(body.items);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(labels.loadFailed);
          setItems([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, locale, labels.loadFailed]);

  if (items === null) {
    return (
      <div className="rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
        <p className="text-frame-silver">{labels.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
        <p className="text-frame-silver">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-frame-border bg-frame-panel p-8 text-center">
        <p className="text-frame-silver">{labels.empty}</p>
        <Link
          href={localePath(locale, "/routines")}
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-neon-cta px-5 py-2.5 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {labels.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.map(({ purchaseId, routine }) => (
        <li key={purchaseId}>
          <RoutineCard
            routine={routine}
            locale={locale}
            labels={{
              viewRoutine: labels.viewRoutine,
              taughtBy: labels.taughtBy,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
