import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  originalPrice: number;
  discountedPrice: number;
  checkoutHref: string;
  labels: {
    pricingNote: string;
    getAccessNow: string;
    secureNote: string;
    guarantees: string[];
  };
  className?: string;
}

export function PricingCard({
  originalPrice,
  discountedPrice,
  checkoutHref,
  labels,
  className,
}: PricingCardProps) {
  const discountPercent = Math.round(
    100 - (discountedPrice / originalPrice) * 100,
  );

  return (
    <div
      className={cn(
        "relative border border-frame-border/70 bg-gradient-to-br from-frame-magenta/10 via-frame-panel to-frame-cyan/10 p-7",
        className,
      )}
    >
      <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-frame-magenta" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-frame-cyan" />

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
      <p className="mt-1 text-xs text-frame-muted">{labels.pricingNote}</p>

      <Link
        href={checkoutHref}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-neon-cta px-5 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
      >
        {labels.getAccessNow}
      </Link>

      <ul className="mt-6 space-y-3 border-t border-frame-border/70 pt-6">
        {labels.guarantees.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-2.5 text-sm text-frame-silver"
          >
            <span className="text-frame-silver">—</span>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-frame-border/70 pt-4 text-xs text-frame-muted">
        {labels.secureNote}
      </p>
    </div>
  );
}

export default PricingCard;
