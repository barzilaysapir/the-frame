import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { localizeLevel, localizeStyle } from "@/lib/i18n/localize";
import {
  routinesFilterHref,
  type DanceStyleKey,
  type LevelKey,
} from "@/lib/routines";

type RoutineFilterTagVariant = "style" | "level";
type RoutineFilterTagSize = "sm" | "md";

interface RoutineFilterTagProps {
  /** Stable filter key (not the localized label). */
  value: string;
  variant: RoutineFilterTagVariant;
  locale: Locale;
  size?: RoutineFilterTagSize;
  className?: string;
}

const sizeClass: Record<RoutineFilterTagSize, string> = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1 text-xs",
};

const variantClass: Record<RoutineFilterTagVariant, string> = {
  style: "bg-frame-magenta text-frame-bg hover:brightness-110",
  level:
    "border border-white/30 bg-black/30 text-white backdrop-blur-sm hover:border-white/60",
};

export function RoutineFilterTag({
  value,
  variant,
  locale,
  size = "md",
  className,
}: RoutineFilterTagProps) {
  const label =
    variant === "style"
      ? localizeStyle(locale, value as DanceStyleKey)
      : localizeLevel(locale, value as LevelKey);

  return (
    <Link
      href={routinesFilterHref({
        locale,
        ...(variant === "style" ? { style: value } : { level: value }),
      })}
      className={cn(
        "rounded-full font-bold transition-[filter,border-color]",
        sizeClass[size],
        variantClass[variant],
        className,
      )}
    >
      {label}
    </Link>
  );
}
