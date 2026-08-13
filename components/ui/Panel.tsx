import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

/** @public Exported so consumers can type a `variant` prop explicitly. */
export type PanelVariant = "static" | "interactive";

const BASE_CLASSES = "rounded-2xl border border-frame-border bg-frame-panel";

const VARIANT_CLASSES: Record<PanelVariant, string> = {
  static: "",
  interactive: "transition-colors hover:border-frame-cyan/60",
};

type PanelProps<T extends ElementType> = {
  as?: T;
  variant?: PanelVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className"> & {
    className?: string;
  };

/**
 * Shared panel surface (`rounded-2xl` + border + `bg-frame-panel`). Renders a
 * `<div>` by default; pass `as` for a `<section>`/`<article>`/`Link`/etc.
 * `variant="interactive"` adds the hover border used by clickable cards.
 * Extra `className` (e.g. padding, `overflow-hidden`) is merged with `cn`.
 */
export function Panel<T extends ElementType = "div">({
  as,
  variant = "static",
  className,
  ...props
}: PanelProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}
