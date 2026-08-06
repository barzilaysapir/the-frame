import Link from "next/link";
import { cn } from "@/lib/utils";

type RoutineFilterTagVariant = "style" | "level";
type RoutineFilterTagSize = "sm" | "md";

interface RoutineFilterTagProps {
  label: string;
  variant: RoutineFilterTagVariant;
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
  label,
  variant,
  size = "md",
  className,
}: RoutineFilterTagProps) {
  return (
    <Link
      href={`/routines?${variant}=${encodeURIComponent(label)}`}
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
