import Image from "next/image";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import { SongCredit } from "@/components/SongCredit";
import { RoutineFilterTag } from "@/components/RoutineFilterTag";
import type { Locale } from "@/lib/i18n/config";
import type { DanceStyleKey, LevelKey } from "@/lib/routines";

interface CheckoutOrderSummaryProps {
  locale: Locale;
  title: string;
  artist: string;
  style: DanceStyleKey;
  level: LevelKey;
  poster: string;
  instructorName: string;
  instructorAvatar?: string;
  taughtByLabel: string;
  originalPrice: number;
  discountedPrice: number;
  pricingNote: string;
}

export function CheckoutOrderSummary({
  locale,
  title,
  artist,
  style,
  level,
  poster,
  instructorName,
  instructorAvatar,
  taughtByLabel,
  originalPrice,
  discountedPrice,
  pricingNote,
}: CheckoutOrderSummaryProps) {
  const discountPercent = Math.round(
    100 - (discountedPrice / originalPrice) * 100,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-frame-border bg-frame-panel">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={poster}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
          priority
        />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          <RoutineFilterTag
            value={style}
            variant="style"
            locale={locale}
            size="sm"
          />
          <RoutineFilterTag
            value={level}
            variant="level"
            locale={locale}
            size="sm"
          />
        </div>

        <div className="mt-4">
          <SongCredit songName={title} artist={artist} />
        </div>

        {instructorName ? (
          <div className="mt-5 flex items-center gap-3">
            <InstructorAvatar
              name={instructorName}
              src={instructorAvatar}
              className="h-10 w-10"
            />
            <p className="text-sm text-frame-silver">
              {taughtByLabel}{" "}
              <span className="font-medium text-white">{instructorName}</span>
            </p>
          </div>
        ) : null}

        <div className="mt-6 border-t border-frame-border pt-5">
          <div dir="ltr" className="flex items-baseline justify-end gap-2.5">
            {discountPercent > 0 ? (
              <span className="text-sm font-bold text-frame-magenta">
                -{discountPercent}%
              </span>
            ) : null}
            <span className="text-base font-medium text-frame-muted line-through">
              ₪{originalPrice}
            </span>
            <span className="font-display text-4xl font-black text-white">
              ₪{discountedPrice}
            </span>
          </div>
          <p className="mt-1 text-xs text-frame-muted">{pricingNote}</p>
        </div>
      </div>
    </section>
  );
}

export default CheckoutOrderSummary;
