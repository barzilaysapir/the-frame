import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SongCredit } from "@/components/SongCredit";
import { RoutineFilterTag } from "@/components/routines/RoutineFilterTag";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Panel } from "@/components/ui/Panel";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/get-dictionary";
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
  const href = localePath(locale, `/routine/${routine.slug}`);

  return (
    <Panel as="article" variant="interactive" className="group overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden">
        <Link href={href} className="absolute inset-0 block">
          <Image
            src={routine.poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-2">
            <RoutineFilterTag
              value={routine.style}
              variant="style"
              size="sm"
              locale={locale}
              className="pointer-events-auto"
            />
            <RoutineFilterTag
              value={routine.level}
              variant="level"
              size="sm"
              locale={locale}
              className="pointer-events-auto"
            />
          </div>
          <FavoriteButton
            routine={routine}
            locale={locale}
            className="pointer-events-auto"
            labels={{ add: labels.favoriteAdd, remove: labels.favoriteRemove }}
          />
        </div>
      </div>

      <Link href={href} className="block p-5">
        <SongCredit songName={routine.title} artist={routine.artist} />
        {instructorName ? (
          <p className="mt-2 text-sm text-frame-silver">
            {formatMessage(labels.taughtBy, { name: instructorName })}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-frame-border pt-4">
          <div dir="ltr" className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">
              ₪{routine.pricing.earlyBird}
            </span>
            <span className="text-xs font-medium text-frame-muted line-through">
              ₪{routine.pricing.original}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-frame-cyan">
            {labels.viewRoutine}
            <ArrowLeft className="h-3.5 w-3.5 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Panel>
  );
}
