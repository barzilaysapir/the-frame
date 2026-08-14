import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SongCredit } from "@/components/SongCredit";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { RoutineFilterTag } from "@/components/routines/RoutineFilterTag";
import { Panel } from "@/components/ui/Panel";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

interface LibraryCardProps {
  href: string;
  poster: string;
  title: string;
  artist?: string;
  instructorName?: string;
  locale: Locale;
  style?: string | null;
  level?: string | null;
  typeLabel?: string;
  priceIls?: number;
  originalPriceIls?: number;
  priceDisplay?: string;
  cta: string;
  taughtBy: string;
  priority?: boolean;
  favorite?: {
    routine: CatalogRoutine;
    add: string;
    remove: string;
  };
}

const typeTagClass = "rounded-full bg-frame-cyan px-2.5 py-1 text-[11px] font-bold text-frame-bg";

export function LibraryCard({
  href,
  poster,
  title,
  artist,
  instructorName,
  locale,
  style,
  level,
  typeLabel,
  priceIls,
  originalPriceIls,
  priceDisplay,
  cta,
  taughtBy,
  priority = false,
  favorite,
}: LibraryCardProps) {
  const showStrike =
    typeof originalPriceIls === "number" &&
    typeof priceIls === "number" &&
    originalPriceIls > priceIls;

  return (
    <Panel as="article" variant="interactive" className="group overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden">
        <Link href={href} className="absolute inset-0 block">
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {style ? (
              <RoutineFilterTag
                value={style}
                variant="style"
                size="sm"
                locale={locale}
                className="pointer-events-auto"
              />
            ) : null}
            {level ? (
              <RoutineFilterTag
                value={level}
                variant="level"
                size="sm"
                locale={locale}
                className="pointer-events-auto"
              />
            ) : null}
            {typeLabel ? <span className={typeTagClass}>{typeLabel}</span> : null}
          </div>
          {favorite ? (
            <FavoriteButton
              routine={favorite.routine}
              locale={locale}
              className="pointer-events-auto"
              labels={{ add: favorite.add, remove: favorite.remove }}
            />
          ) : null}
        </div>
      </div>

      <Link href={href} className="block p-5">
        <SongCredit songName={title} artist={artist} />
        {instructorName ? (
          <p className="mt-2 text-sm text-frame-silver">
            {formatMessage(taughtBy, { name: instructorName })}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-frame-border pt-4">
          <div dir="ltr" className="flex items-baseline gap-2">
            {priceDisplay ? (
              <span className="text-lg font-bold text-white">{priceDisplay}</span>
            ) : (
              <>
                <span className="text-lg font-bold text-white">₪{priceIls}</span>
                {showStrike ? (
                  <span className="text-xs font-medium text-frame-muted line-through">
                    ₪{originalPriceIls}
                  </span>
                ) : null}
              </>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-frame-cyan">
            {cta}
            <ArrowLeft className="h-3.5 w-3.5 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Panel>
  );
}
