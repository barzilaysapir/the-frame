"use client";

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
  expanded: CheckoutPlanId | null;
  onToggle: (id: CheckoutPlanId) => void;
  chooseLabel: string;
  rentalPrice: number;
  rentalOriginalPrice: number;
  subscriptionPrice: number;
  rentalCopy: PlanCopy;
  subscriptionCopy: PlanCopy;
}

export function CheckoutPlanPicker({
  selected,
  expanded,
  onToggle,
  chooseLabel,
  rentalPrice,
  rentalOriginalPrice,
  subscriptionPrice,
  rentalCopy,
  subscriptionCopy,
}: CheckoutPlanPickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium text-white">
        {chooseLabel}
      </legend>
      <CheckoutPlanOption
        id="rental"
        selected={selected === "rental"}
        expanded={expanded === "rental"}
        onToggle={onToggle}
        price={rentalPrice}
        originalPrice={rentalOriginalPrice}
        copy={rentalCopy}
      />
      <CheckoutPlanOption
        id="subscription"
        selected={selected === "subscription"}
        expanded={expanded === "subscription"}
        onToggle={onToggle}
        price={subscriptionPrice}
        copy={subscriptionCopy}
      />
    </fieldset>
  );
}

export default CheckoutPlanPicker;
