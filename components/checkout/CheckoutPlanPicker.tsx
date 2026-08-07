"use client";

import { CheckoutPlanOption } from "@/components/checkout/CheckoutPlanOption";
import type { CheckoutPlanId } from "@/lib/pricing";

interface PlanCopy {
  title: string;
  description: string;
  priceNote: string;
}

interface CheckoutPlanPickerProps {
  selected: CheckoutPlanId;
  onSelect: (id: CheckoutPlanId) => void;
  chooseLabel: string;
  rentalPrice: number;
  rentalOriginalPrice: number;
  subscriptionPrice: number;
  rentalCopy: PlanCopy;
  subscriptionCopy: PlanCopy;
}

export function CheckoutPlanPicker({
  selected,
  onSelect,
  chooseLabel,
  rentalPrice,
  rentalOriginalPrice,
  subscriptionPrice,
  rentalCopy,
  subscriptionCopy,
}: CheckoutPlanPickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-white">{chooseLabel}</legend>
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
        copy={subscriptionCopy}
      />
    </fieldset>
  );
}

export default CheckoutPlanPicker;
