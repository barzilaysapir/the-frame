import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  originalPrice: number;
  discountedPrice: number;
  checkoutHref: string;
  className?: string;
}

const GUARANTEES = [
  "גישה לכל החיים לכל הפירוקים",
  "מצבי תרגול בהאטה ובמראה",
  "צפייה בכל מכשיר, לתמיד",
  "אחריות להחזר כספי למשך 7 ימים",
];

export function PricingCard({
  originalPrice,
  discountedPrice,
  checkoutHref,
  className,
}: PricingCardProps) {
  const discountPercent = Math.round(
    100 - (discountedPrice / originalPrice) * 100
  );

  return (
    <div
      className={cn(
        "relative border border-frame-border/70 bg-frame-panel p-7",
        className
      )}
    >
      {/* corner accents, echoing the brand mark's viewfinder frame */}
      <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white/70" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white/70" />

      <div dir="ltr" className="flex items-baseline justify-end gap-2.5">
        {discountPercent > 0 && (
          <span className="text-sm font-medium text-frame-silver">
            -{discountPercent}%
          </span>
        )}
        <span className="text-base font-medium text-frame-muted line-through">
          ₪{originalPrice}
        </span>
        <span className="font-display text-4xl font-bold text-white">
          ₪{discountedPrice}
        </span>
      </div>
      <p className="mt-1 text-xs text-frame-muted">
        תשלום חד פעמי &middot; גישה לכל החיים
      </p>

      <Link
        href={checkoutHref}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-frame-bg transition-colors hover:bg-frame-silver"
      >
        קבלו גישה מיידית
      </Link>

      <ul className="mt-6 space-y-3 border-t border-frame-border/70 pt-6">
        {GUARANTEES.map((item) => (
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
        תשלום מאובטח &middot; גישה מיידית מובטחת
      </p>
    </div>
  );
}

export default PricingCard;
