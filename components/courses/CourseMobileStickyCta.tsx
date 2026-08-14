import { GetAccessButton } from "@/components/checkout/GetAccessButton";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CourseMobileStickyCtaProps {
  priceIls: number;
  checkoutHref: string;
  ctaLabel: string;
  loginErrors: Dictionary["login"]["errors"];
}

export function CourseMobileStickyCta({
  priceIls,
  checkoutHref,
  ctaLabel,
  loginErrors,
}: CourseMobileStickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-frame-border bg-frame-bg/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <span dir="ltr" className="text-lg font-bold text-white">
          ₪{priceIls}
        </span>
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
