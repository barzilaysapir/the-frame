import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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
        "rounded-2xl border border-frame-border bg-frame-panel p-6 shadow-glow",
        className
      )}
    >
      <div dir="ltr" className="flex items-baseline justify-end gap-2">
        <span className="text-3xl font-bold text-white">
          ₪{discountedPrice}
        </span>
        <span className="text-base font-medium text-frame-muted line-through">
          ₪{originalPrice}
        </span>
        <span className="rounded-full bg-frame-gold/15 px-2 py-0.5 text-xs font-semibold text-frame-gold">
          -{discountPercent}%
        </span>
      </div>
      <p className="mt-1 text-xs text-frame-muted">
        תשלום חד פעמי &middot; גישה לכל החיים
      </p>

      <Link
        href={checkoutHref}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-frame-bg transition-colors hover:bg-frame-gold"
      >
        קבלו גישה מיידית
      </Link>

      <ul className="mt-5 space-y-2.5">
        {GUARANTEES.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-frame-silver"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-frame-gold" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-2 border-t border-frame-border pt-4 text-xs text-frame-muted">
        <ShieldCheck className="h-4 w-4 shrink-0 text-frame-gold" />
        תשלום מאובטח &middot; גישה מיידית מובטחת
      </div>
    </div>
  );
}

export default PricingCard;
