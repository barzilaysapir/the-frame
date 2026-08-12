"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutPlanId } from "@/lib/pricing";

interface PlanCopy {
  title: string;
  description: string;
  priceNote: string;
  guarantees: string[];
}

interface CheckoutPlanOptionProps {
  id: CheckoutPlanId;
  selected: boolean;
  onSelect: (id: CheckoutPlanId) => void;
  price: number;
  originalPrice?: number;
  copy: PlanCopy;
}

/** Compact plan row; the selected plan stays expanded with details. */
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
  const panelId = `checkout-plan-${id}`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        selected
          ? "border-frame-cyan bg-frame-cyan/10"
          : "border-frame-border bg-frame-bg/40",
      )}
    >
      <button
        id={`checkout-plan-option-${id}`}
        type="button"
        role="radio"
        aria-checked={selected}
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect(id)}
        className="flex w-full items-center gap-3 px-4 py-3 text-start"
      >
        <span
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border",
            selected
              ? "border-frame-cyan bg-frame-cyan"
              : "border-frame-muted bg-transparent",
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-sm font-semibold text-white">
          {copy.title}
        </span>
        <span dir="ltr" className="shrink-0 text-end">
          {showStrike ? (
            <span className="me-1.5 text-xs text-frame-muted line-through">
              ₪{originalPrice}
            </span>
          ) : null}
          <span className="font-display text-lg font-black text-white">
            ₪{price}
          </span>
          <span className="ms-1 text-[11px] text-frame-muted">
            {copy.priceNote}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-frame-silver transition-transform",
            selected && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {selected ? (
        <div
          id={panelId}
          className="border-t border-frame-border/70 px-4 pb-4 pt-3"
        >
          <p className="text-xs text-frame-silver">{copy.description}</p>
          <ul className="mt-3 space-y-2">
            {copy.guarantees.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-2 text-xs text-frame-silver"
              >
                <span className="text-frame-muted">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
