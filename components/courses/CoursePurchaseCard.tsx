import { GetAccessButton } from "@/components/checkout/GetAccessButton";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

interface CoursePurchaseCardProps {
  priceIls: number;
  checkoutHref: string;
  loginErrors: Dictionary["login"]["errors"];
  labels: {
    pricingNote: string;
    getAccessNow: string;
    secureNote: string;
    guarantees: string[];
  };
  className?: string;
}

export function CoursePurchaseCard({
  priceIls,
  checkoutHref,
  loginErrors,
  labels,
  className,
}: CoursePurchaseCardProps) {
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
        <span className="font-display text-4xl font-black text-white">
          ₪{priceIls}
        </span>
      </div>
      <p className="mt-1 text-xs text-frame-muted">{labels.pricingNote}</p>

      <div className="mt-6">
        <GetAccessButton
          checkoutHref={checkoutHref}
          label={labels.getAccessNow}
          loginErrors={loginErrors}
        />
      </div>

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
