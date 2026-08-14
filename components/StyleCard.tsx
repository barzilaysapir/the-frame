import Link from "next/link";
import Image from "next/image";
import { Panel } from "@/components/ui/Panel";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { routinesFilterHref, type DanceStyleKey } from "@/lib/routines";

interface StyleCardProps {
  style: DanceStyleKey;
  label: string;
  poster: string;
  countLabel: string;
  locale: Locale;
  priority?: boolean;
  browseAria: string;
}

export function StyleCard({
  style,
  label,
  poster,
  countLabel,
  locale,
  priority = false,
  browseAria,
}: StyleCardProps) {
  return (
    <Panel
      as={Link}
      href={routinesFilterHref({ style, locale })}
      aria-label={formatMessage(browseAria, { name: label })}
      variant="interactive"
      className="group block overflow-hidden"
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
        <p className="mt-5 border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
          {countLabel}
        </p>
      </div>
    </Panel>
  );
}
