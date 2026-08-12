"use client";

import type { KeyboardEvent } from "react";
import { CheckoutPlanOption } from "@/components/checkout/CheckoutPlanOption";
import type { CheckoutPlanId } from "@/lib/pricing";

interface PlanCopy {
  title: string;
  description: string;
  priceNote: string;
  guarantees: string[];
}

interface CheckoutPlanPickerProps {
  selected: CheckoutPlanId;
  onSelect: (id: CheckoutPlanId) => void;
  chooseLabel: string;
  rentalPrice: number;
  rentalOriginalPrice: number;
  subscriptionPrice: number;
  subscriptionOriginalPrice: number;
  rentalCopy: PlanCopy;
  subscriptionCopy: PlanCopy;
}

const PLAN_IDS: CheckoutPlanId[] = ["rental", "subscription"];

export function CheckoutPlanPicker({
  selected,
  onSelect,
  chooseLabel,
  rentalPrice,
  rentalOriginalPrice,
  subscriptionPrice,
  subscriptionOriginalPrice,
  rentalCopy,
  subscriptionCopy,
}: CheckoutPlanPickerProps) {
  // ARIA APG radiogroup pattern: arrow keys move selection between options
  // (mirroring native <input type="radio"> group behavior for role="radio").
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentIndex = PLAN_IDS.indexOf(selected);
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + PLAN_IDS.length) % PLAN_IDS.length;
    const nextId = PLAN_IDS[nextIndex];
    onSelect(nextId);
    // Roving tabindex: move DOM focus to match the newly selected option
    // (its tabIndex becomes 0 on re-render; focusing works regardless of
    // the current tabIndex value).
    document.getElementById(`checkout-plan-option-${nextId}`)?.focus();
  };

  return (
    <fieldset
      className="space-y-2"
      role="radiogroup"
      onKeyDown={handleKeyDown}
    >
      <legend className="mb-1 text-sm font-medium text-white">
        {chooseLabel}
      </legend>
      <CheckoutPlanOption
        id="rental"
        selected={selected === "rental"}
        onSelect={onSelect}
        price={rentalPrice}
        originalPrice={rentalOriginalPrice}
        copy={rentalCopy}
      />
      <CheckoutPlanOption
        id="subscription"
        selected={selected === "subscription"}
        onSelect={onSelect}
        price={subscriptionPrice}
        originalPrice={subscriptionOriginalPrice}
        copy={subscriptionCopy}
      />
    </fieldset>
  );
}
