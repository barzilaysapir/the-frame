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
  onSelect: (id: CheckoutPlanId) => void;
  chooseLabel: string;
  rentalPrice: number;
  rentalOriginalPrice: number;
  subscriptionPrice: number;
  subscriptionOriginalPrice: number;
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
  subscriptionOriginalPrice,
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

export default CheckoutPlanPicker;
