"use client";

import { useState } from "react";
import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import { CheckoutPlanPicker } from "@/components/checkout/CheckoutPlanPicker";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import { courseCreditsBundlePricing } from "@/lib/pricing";

type CoursePlanId = "course" | "course-credits";

interface CourseCheckoutProps {
  locale: Locale;
  courseSlug: string;
  title: string;
  instructorName: string;
  taughtByLabel: string;
  priceIls: number;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
}

function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return formatMessage(template, values);
}

export function CourseCheckout({
  locale,
  courseSlug,
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
  const vars = {
    count: bundle.extraCredits,
    creditPrice: bundle.creditPrice,
    coursePrice: priceIls,
    creditsList: bundle.creditsList,
    saved: bundle.saved,
    percent: bundle.discountPercent,
  };
  const credits = labels.plans.courseCredits;
  const creditsCopy = {
    title: fill(credits.title, vars),
    description: fill(credits.description, vars),
    priceNote: fill(credits.priceNote, vars),
    paymentBody: fill(credits.paymentBody, vars),
    breakdown: [
      fill(credits.lineCourse, vars),
      fill(credits.lineCredits, vars),
      fill(credits.lineDiscount, vars),
    ],
    guarantees: credits.guarantees.map((item) => fill(item, vars)),
  };
  const singleCopy = labels.plans.course;

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
        <p className="mt-4 text-sm leading-relaxed text-frame-silver">
          {labels.creditExplainer}
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
        itemType="external_course"
        itemSlug={courseSlug}
        planId={plan}
        amountIls={plan === "course" ? priceIls : bundle.sale}
        itemHref={localePath(locale, `/external-courses/${courseSlug}`)}
      />
    </div>
  );
}
