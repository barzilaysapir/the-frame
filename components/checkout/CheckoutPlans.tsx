"use client";

import { useState } from "react";
import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import { CheckoutPlanPicker } from "@/components/checkout/CheckoutPlanPicker";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import {
  MONTHLY_SUBSCRIPTION,
  type CheckoutPlanId,
} from "@/lib/pricing";

interface CheckoutPlansProps {
  locale: Locale;
  routineSlug: string;
  rentalOriginalPrice: number;
  rentalPrice: number;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
  termsDict: Dictionary["terms"];
  closeLabel: string;
}

/** Plan picker + payment — no title/instructor header here, since the page embedding this already shows that above it (mirrors CourseCheckout). */
export function CheckoutPlans({
  locale,
  routineSlug,
  rentalOriginalPrice,
  rentalPrice,
  labels,
  loginErrors,
  continueGoogleLabel,
  termsDict,
  closeLabel,
}: CheckoutPlansProps) {
  const [plan, setPlan] = useState<CheckoutPlanId>("rental");

  return (
    <div className="space-y-8">
      <CheckoutPlanPicker
        selected={plan}
        onSelect={(id) => setPlan(id as CheckoutPlanId)}
        chooseLabel={labels.plans.chooseLabel}
        plans={[
          {
            id: "rental",
            price: rentalPrice,
            originalPrice: rentalOriginalPrice,
            copy: labels.plans.rental,
          },
          {
            id: "subscription",
            price: MONTHLY_SUBSCRIPTION.earlyBird,
            originalPrice: MONTHLY_SUBSCRIPTION.original,
            copy: labels.plans.subscription,
          },
        ]}
      />

      <CheckoutPaymentPlaceholder
        locale={locale}
        labels={labels}
        loginErrors={loginErrors}
        continueGoogleLabel={continueGoogleLabel}
        termsDict={termsDict}
        closeLabel={closeLabel}
        itemType="lesson"
        itemSlug={routineSlug}
        planId={plan}
        itemHref={localePath(locale, `/routine/${routineSlug}`)}
      />
    </div>
  );
}
