"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { LibraryCard } from "@/components/routines/LibraryCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogExternalCourse, CatalogRoutine } from "@/lib/server/catalog/types";

type LibraryItem =
  | {
      purchaseId: string;
      paidAt: string | null;
      itemType: "lesson";
      routine: CatalogRoutine;
    }
  | {
      purchaseId: string;
      paidAt: string | null;
      itemType: "external_course";
      course: CatalogExternalCourse;
    };

interface AccountLibraryProps {
  locale: Locale;
  labels: {
    empty: string;
    loading: string;
    loadFailed: string;
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
      <StateBox>
        <p className="text-frame-silver">{labels.loading}</p>
      </StateBox>
    );
  }

  if (error) {
    return (
      <StateBox>
        <p className="text-frame-silver">{error}</p>
      </StateBox>
    );
  }

  if (items.length === 0) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.empty}</p>
        <Button
          href={localePath(locale, "/routines")}
          className="group mt-5 py-2.5"
        >
          {labels.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Button>
      </StateBox>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.purchaseId}>
          {item.itemType === "lesson" ? (
            <RoutineCard
              routine={item.routine}
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
              href={localePath(locale, `/external-courses/${item.course.slug}`)}
              poster={item.course.coverImage}
              title={item.course.title}
              instructorName={item.course.provider}
              locale={locale}
              style={item.course.style}
              level={item.course.level}
              typeLabel={labels.externalCourseTag}
              priceDisplay={item.course.priceDisplay}
              cta={labels.externalCourseCta}
              taughtBy={labels.taughtBy}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
