import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentProps,
} from "react";
import { cn } from "@/lib/utils";

/** @public Exported so consumers can type a `variant` prop explicitly. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-[filter,color,border-color,opacity] disabled:opacity-50";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-neon-cta text-frame-bg hover:brightness-110",
  secondary:
    "border border-frame-border text-frame-silver hover:border-white/40 hover:text-white",
  ghost:
    "border border-frame-border text-white hover:border-frame-magenta hover:text-frame-magenta",
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
}

type ButtonAsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    href?: undefined;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentProps<typeof Link>, "href"> & {
    href: ComponentProps<typeof Link>["href"];
  } & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared CTA button. Renders a `<Link>` when `href` is passed, otherwise a
 * `<button type="button">`. Extra `className` (e.g. one-off padding/width)
 * is merged with `cn`, which resolves conflicting Tailwind utilities so
 * overrides like a different `px-*`/`py-*` reliably win over the default.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if (props.href !== undefined) {
    const { href, ...linkProps } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButton;
  return <button type={type} className={classes} {...buttonProps} />;
}
