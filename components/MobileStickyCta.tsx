import Link from "next/link";

interface MobileStickyCtaProps {
  originalPrice: number;
  discountedPrice: number;
  checkoutHref: string;
}

export function MobileStickyCta({
  originalPrice,
  discountedPrice,
  checkoutHref,
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
        <Link
          href={checkoutHref}
          className="max-w-[220px] flex-1 rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-frame-bg transition-colors hover:bg-frame-silver"
        >
          קבלו גישה מיידית
        </Link>
      </div>
    </div>
  );
}

export default MobileStickyCta;
