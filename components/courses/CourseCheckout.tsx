"use client";

import { useState } from "react";
import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import { CheckoutPlanPicker } from "@/components/checkout/CheckoutPlanPicker";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import { courseCreditsBundlePricing } from "@/lib/pricing";

type CoursePlanId = "course" | "course-credits";

interface CourseCheckoutProps {
  locale: Locale;
  title: string;
  instructorName: string;
  taughtByLabel: string;
  priceIls: number;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
}

function withCreditCount<T extends Record<string, unknown>>(
  copy: T,
  count: number,
): T {
  const result = { ...copy };
  for (const [key, value] of Object.entries(copy)) {
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = formatMessage(value, { count });
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === "string" ? formatMessage(item, { count }) : item,
      );
    }
  }
  return result;
}

export function CourseCheckout({
  locale,
  title,
  instructorName,
  taughtByLabel,
  priceIls,
  labels,
  loginErrors,
  continueGoogleLabel,
}: CourseCheckoutProps) {
  const [plan, setPlan] = useState<CoursePlanId>("course");
  const bundle = courseCreditsBundlePricing(priceIls);
  const singleCopy = labels.plans.course;
  const creditsCopy = withCreditCount(labels.plans.courseCredits, bundle.extraCredits);

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xl font-black text-white sm:text-2xl">
          {title}
        </p>
        <p className="mt-1 text-sm text-frame-silver">
          {taughtByLabel}{" "}
          <span className="font-medium text-white">{instructorName}</span>
        </p>
      </div>

      <CheckoutPlanPicker
        selected={plan}
        onSelect={(id) => setPlan(id as CoursePlanId)}
        chooseLabel={labels.plans.chooseLabel}
        plans={[
          {
            id: "course",
            price: priceIls,
            copy: singleCopy,
          },
          {
            id: "course-credits",
            price: bundle.sale,
            originalPrice: bundle.original,
            copy: creditsCopy,
          },
        ]}
      />

      <CheckoutPaymentPlaceholder
        locale={locale}
        labels={labels}
        loginErrors={loginErrors}
        continueGoogleLabel={continueGoogleLabel}
        paymentBody={
          plan === "course" ? singleCopy.paymentBody : creditsCopy.paymentBody
        }
      />
    </div>
  );
}
