import { GetAccessButton } from "@/components/checkout/GetAccessButton";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface MobileStickyCtaProps {
  originalPrice: number;
  discountedPrice: number;
  checkoutHref: string;
  ctaLabel: string;
  loginErrors: Dictionary["login"]["errors"];
}

export function MobileStickyCta({
  originalPrice,
  discountedPrice,
  checkoutHref,
  ctaLabel,
  loginErrors,
}: MobileStickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-frame-border bg-frame-bg/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div dir="ltr" className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">
            ₪{discountedPrice}
          </span>
          <span className="text-xs font-medium text-frame-muted line-through">
            ₪{originalPrice}
          </span>
        </div>
        <div className="max-w-[220px] flex-1">
          <GetAccessButton
            checkoutHref={checkoutHref}
            label={ctaLabel}
            loginErrors={loginErrors}
            className="py-2.5"
          />
        </div>
      </div>
    </div>
  );
}
