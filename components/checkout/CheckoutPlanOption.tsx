"use client";

import { cn } from "@/lib/utils";
import type { CheckoutPlanId } from "@/lib/pricing";

interface PlanCopy {
  title: string;
  description: string;
  priceNote: string;
}

interface CheckoutPlanOptionProps {
  id: CheckoutPlanId;
  selected: boolean;
  onSelect: (id: CheckoutPlanId) => void;
  price: number;
  originalPrice?: number;
  copy: PlanCopy;
}

export function CheckoutPlanOption({
  id,
  selected,
  onSelect,
  price,
  originalPrice,
  copy,
}: CheckoutPlanOptionProps) {
  const showStrike =
    typeof originalPrice === "number" && originalPrice > price;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-2xl border px-4 py-4 text-start transition-colors",
        selected
          ? "border-frame-cyan bg-frame-cyan/10"
          : "border-frame-border bg-frame-bg/40 hover:border-frame-silver/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{copy.title}</p>
          <p className="mt-1 text-xs text-frame-silver">{copy.description}</p>
        </div>
        <div dir="ltr" className="shrink-0 text-end">
          {showStrike ? (
            <p className="text-xs text-frame-muted line-through">
              ₪{originalPrice}
            </p>
          ) : null}
          <p className="font-display text-2xl font-black text-white">₪{price}</p>
          <p className="text-[11px] text-frame-muted">{copy.priceNote}</p>
        </div>
      </div>
    </button>
  );
}

export default CheckoutPlanOption;
