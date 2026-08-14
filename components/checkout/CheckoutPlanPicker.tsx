"use client";

import type { KeyboardEvent } from "react";
import {
  CheckoutPlanOption,
  type CheckoutPlanCopy,
} from "@/components/checkout/CheckoutPlanOption";

export interface CheckoutPlanChoice {
  id: string;
  price: number;
  originalPrice?: number;
  copy: CheckoutPlanCopy;
}

interface CheckoutPlanPickerProps {
  selected: string;
  onSelect: (id: string) => void;
  chooseLabel: string;
  plans: CheckoutPlanChoice[];
}

export function CheckoutPlanPicker({
  selected,
  onSelect,
  chooseLabel,
  plans,
}: CheckoutPlanPickerProps) {
  const planIds = plans.map((plan) => plan.id);

  // ARIA APG radiogroup pattern: arrow keys move selection between options
  // (mirroring native <input type="radio"> group behavior for role="radio").
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentIndex = Math.max(0, planIds.indexOf(selected));
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + planIds.length) % planIds.length;
    const nextId = planIds[nextIndex];
    onSelect(nextId);
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
      {plans.map((plan) => (
        <CheckoutPlanOption
          key={plan.id}
          id={plan.id}
          selected={selected === plan.id}
          onSelect={onSelect}
          price={plan.price}
          originalPrice={plan.originalPrice}
          copy={plan.copy}
        />
      ))}
    </fieldset>
  );
}
