interface CheckoutLineItemProps {
  title: string;
  instructorName?: string;
  taughtByLabel: string;
  originalPrice: number;
  discountedPrice: number;
  pricingNote: string;
}

/** Compact order line — no product card; payment stays the focus. */
export function CheckoutLineItem({
  title,
  instructorName,
  taughtByLabel,
  originalPrice,
  discountedPrice,
  pricingNote,
}: CheckoutLineItemProps) {
  const discountPercent = Math.round(
    100 - (discountedPrice / originalPrice) * 100,
  );

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-frame-border pb-6">
      <div className="min-w-0">
        <p className="font-display text-xl font-black text-white sm:text-2xl">
          {title}
        </p>
        {instructorName ? (
          <p className="mt-1 text-sm text-frame-silver">
            {taughtByLabel}{" "}
            <span className="font-medium text-white">{instructorName}</span>
          </p>
        ) : null}
      </div>

      <div className="text-end">
        <div dir="ltr" className="flex items-baseline justify-end gap-2">
          {discountPercent > 0 ? (
            <span className="text-sm font-bold text-frame-magenta">
              -{discountPercent}%
            </span>
          ) : null}
          <span className="text-sm font-medium text-frame-muted line-through">
            ₪{originalPrice}
          </span>
          <span className="font-display text-3xl font-black text-white">
            ₪{discountedPrice}
          </span>
        </div>
        <p className="mt-1 text-xs text-frame-muted">{pricingNote}</p>
      </div>
    </div>
  );
}

export default CheckoutLineItem;
