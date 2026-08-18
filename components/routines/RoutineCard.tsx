import { LibraryCard } from "@/components/routines/LibraryCard";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

interface RoutineCardProps {
  routine: CatalogRoutine;
  locale: Locale;
  instructorName?: string;
  /** Set for above-the-fold cards (first grid row) to improve LCP. */
  priority?: boolean;
  labels: {
    viewRoutine: string;
    taughtBy: string;
    favoriteAdd: string;
    favoriteRemove: string;
  };
}

export function RoutineCard({
  routine,
  locale,
  instructorName,
  priority = false,
  labels,
}: RoutineCardProps) {
  return (
    <LibraryCard
      href={localePath(locale, `/routine/${routine.slug}`)}
      poster={routine.poster}
      title={routine.title}
      artist={routine.artist}
      instructorName={instructorName}
      locale={locale}
      style={routine.style}
      level={routine.level}
      priceIls={routine.pricing.earlyBird}
      originalPriceIls={routine.pricing.original}
      cta={labels.viewRoutine}
      taughtBy={labels.taughtBy}
      priority={priority}
      favorite={{
        item: { itemType: "routine", slug: routine.slug, routine },
        add: labels.favoriteAdd,
        remove: labels.favoriteRemove,
      }}
    />
  );
}
