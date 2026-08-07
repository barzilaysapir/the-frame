"use client";

import { useState } from "react";
import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import { CheckoutPlanPicker } from "@/components/checkout/CheckoutPlanPicker";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import {
  MONTHLY_SUBSCRIPTION_ILS,
  type CheckoutPlanId,
} from "@/lib/pricing";

interface CheckoutPlansProps {
  locale: Locale;
  routineTitle: string;
  instructorName?: string;
  taughtByLabel: string;
  rentalOriginalPrice: number;
  rentalPrice: number;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
}

export function CheckoutPlans({
  locale,
  routineTitle,
  instructorName,
  taughtByLabel,
  rentalOriginalPrice,
  rentalPrice,
  labels,
  loginErrors,
  continueGoogleLabel,
}: CheckoutPlansProps) {
  const [plan, setPlan] = useState<CheckoutPlanId>("rental");
  const [expanded, setExpanded] = useState<CheckoutPlanId | null>(null);

  const handleToggle = (id: CheckoutPlanId) => {
    setPlan(id);
    setExpanded((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xl font-black text-white sm:text-2xl">
          {routineTitle}
        </p>
        {instructorName ? (
          <p className="mt-1 text-sm text-frame-silver">
            {taughtByLabel}{" "}
            <span className="font-medium text-white">{instructorName}</span>
          </p>
        ) : null}
      </div>

      <CheckoutPlanPicker
        selected={plan}
        expanded={expanded}
        onToggle={handleToggle}
        chooseLabel={labels.plans.chooseLabel}
        rentalPrice={rentalPrice}
        rentalOriginalPrice={rentalOriginalPrice}
        subscriptionPrice={MONTHLY_SUBSCRIPTION_ILS}
        rentalCopy={labels.plans.rental}
        subscriptionCopy={labels.plans.subscription}
      />

      <CheckoutPaymentPlaceholder
        locale={locale}
        labels={labels}
        loginErrors={loginErrors}
        continueGoogleLabel={continueGoogleLabel}
        paymentBody={
          plan === "rental"
            ? labels.plans.rental.paymentBody
            : labels.plans.subscription.paymentBody
        }
      />
    </div>
  );
}

export default CheckoutPlans;
