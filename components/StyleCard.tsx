import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { routinesFilterHref, type DanceStyleKey } from "@/lib/routines";

interface StyleCardProps {
  style: DanceStyleKey;
  label: string;
  poster: string;
  routineCount: number;
  locale: Locale;
  priority?: boolean;
  labels: {
    routineOne: string;
    routineMany: string;
    browseAria: string;
  };
}

export function StyleCard({
  style,
  label,
  poster,
  routineCount,
  locale,
  priority = false,
  labels,
}: StyleCardProps) {
  return (
    <Link
      href={routinesFilterHref({ style, locale })}
      aria-label={formatMessage(labels.browseAria, { name: label })}
      className="group block overflow-hidden rounded-2xl border border-frame-border bg-frame-panel transition-colors hover:border-frame-cyan/60"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-black text-white">{label}</h3>
        {routineCount > 0 ? (
          <p className="mt-5 border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
            {routineCount === 1
              ? labels.routineOne
              : formatMessage(labels.routineMany, { count: routineCount })}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default StyleCard;
