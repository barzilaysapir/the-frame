import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CourseCheckoutProps {
  locale: Locale;
  title: string;
  instructorName: string;
  taughtByLabel: string;
  priceIls: number;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
  paymentBody: string;
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
  paymentBody,
}: CourseCheckoutProps) {
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
        <p dir="ltr" className="mt-4 font-display text-3xl font-black text-white">
          ₪{priceIls}
        </p>
      </div>

      <CheckoutPaymentPlaceholder
        locale={locale}
        labels={labels}
        loginErrors={loginErrors}
        continueGoogleLabel={continueGoogleLabel}
        paymentBody={paymentBody}
      />
    </div>
  );
}
