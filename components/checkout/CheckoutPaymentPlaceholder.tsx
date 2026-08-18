"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { BitPaymentCard } from "@/components/checkout/BitPaymentCard";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import { BIT_PAYMENT_INFO } from "@/lib/bit-payment";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, a valid UI plan choice that isn't wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

/** Mirrors `IL_MOBILE_RE` in `app/api/v1/me/purchases/route.ts` — client-side check is just for a fast error message, the server always re-validates. */
const IL_MOBILE_RE = /^05\d{8}$/;

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present once Grow (Meshulam) is configured — redirect here instead of showing manual Bit instructions. */
  redirectUrl?: string;
  /** Present once uPay is configured — must be submitted as a real POST form (uPay's endpoint isn't a plain redirect link), see the hidden form below. */
  upayForm?: { action: string; fields: Record<string, string> };
}

interface CheckoutPaymentPlaceholderProps {
  locale: Locale;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
  paymentBody: string;
  itemType: "lesson" | "external_course";
  itemSlug: string;
  planId: CheckoutPurchasePlanId;
  /** Display-only amount shown in the Bit instructions — the real charge is always recomputed server-side in POST /api/v1/me/purchases. */
  amountIls: number;
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

/**
 * Redirects to Grow (Meshulam)'s hosted payment page once Grow is
 * configured (see POST /api/v1/me/purchases); falls back to the Phase-1
 * manual Bit flow — a `pending` purchase confirmed by the site owner on
 * app/[locale]/admin/purchases — when it isn't.
 */
export function CheckoutPaymentPlaceholder({
  locale,
  labels,
  loginErrors,
  continueGoogleLabel,
  paymentBody,
  itemType,
  itemSlug,
  planId,
  amountIls,
  itemHref,
}: CheckoutPaymentPlaceholderProps) {
  const { user, loading, isConfigured } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnedFromPayment = searchParams.get("payment");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const upayFormRef = useRef<HTMLFormElement>(null);

  const planSupported = planId !== "subscription";

  const handleContinue = async () => {
    if (!user) return;
    const cleanedPhone = phone.replace(/[\s-]/g, "");
    if (!IL_MOBILE_RE.test(cleanedPhone)) {
      setPhoneError(labels.phoneError);
      return;
    }
    setPhoneError(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetchWithAuth(user, "/api/v1/me/purchases", {
        method: "POST",
        body: JSON.stringify({
          itemType,
          itemSlug,
          planId,
          locale,
          phone: cleanedPhone,
          returnPath: pathname,
        }),
      });
      if (!res.ok) {
        throw new Error(`purchase request failed with ${res.status}`);
      }
      const data = (await res.json()) as PurchaseApiResponse;
      setResult(data);
      setBusy(false);
    } catch (err) {
      console.error("[CheckoutPaymentPlaceholder] purchase request failed:", err);
      setError(labels.payError);
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Panel className="p-6 text-sm text-frame-silver">{labels.loading}</Panel>
    );
  }

  return (
    <Panel className="p-6">
      <h2 className="font-display text-2xl font-black text-white">
        {labels.paymentTitle}
      </h2>
      <p className="mt-2 text-sm text-frame-silver">{paymentBody}</p>

      {!isConfigured ? (
        <p className="mt-6 rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
          {labels.authUnavailable}
        </p>
      ) : !user ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-white">{labels.signInPrompt}</p>
          <GoogleSignInButton
            label={continueGoogleLabel}
            errors={loginErrors}
            onError={setError}
          />
          <Link
            href={localePath(locale, "/login")}
            className="block text-center text-xs font-medium text-frame-muted hover:text-white"
          >
            {labels.otherSignIn}
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-frame-silver">
            {labels.signedInAs}{" "}
            <span className="font-medium text-white">
              {user.displayName || user.email || user.phoneNumber}
            </span>
          </p>

          {result?.status === "paid" ? (
            <>
              <p className="text-sm font-medium text-white">{labels.alreadyOwned}</p>
              <Button href={itemHref} className="w-full">
                {labels.alreadyOwnedCta}
              </Button>
            </>
          ) : result ? (
            <>
              <p className="text-sm font-medium text-white">{labels.choosePaymentMethod}</p>
              {result.redirectUrl ? (
                <Button href={result.redirectUrl} className="w-full">
                  {labels.payWithGrowCta}
                </Button>
              ) : null}
              {result.upayForm ? (
                <>
                  <form
                    ref={upayFormRef}
                    method="POST"
                    action={result.upayForm.action}
                    className="hidden"
                  >
                    {Object.entries(result.upayForm.fields).map(([name, value]) => (
                      <input key={name} type="hidden" name={name} value={value} />
                    ))}
                  </form>
                  <Button
                    onClick={() => upayFormRef.current?.submit()}
                    variant={result.redirectUrl ? "secondary" : "primary"}
                    className="w-full"
                  >
                    {labels.payByCardCta}
                  </Button>
                </>
              ) : null}
              {result.redirectUrl || result.upayForm ? (
                <p className="text-center text-xs text-frame-muted">{labels.orPayByBit}</p>
              ) : null}
              <BitPaymentCard
                amountIls={amountIls}
                phone={BIT_PAYMENT_INFO}
                labels={labels.bitCard}
              />
              <p className="text-xs text-frame-muted">{labels.bitConfirmationBody}</p>
            </>
          ) : returnedFromPayment === "success" ? (
            <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
              <p className="text-sm font-medium text-white">{labels.bitConfirmationTitle}</p>
              <p className="mt-1 text-sm text-frame-silver">{labels.bitConfirmationBody}</p>
            </div>
          ) : !planSupported ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.planUnavailable}
            </p>
          ) : (
            <>
              {returnedFromPayment === "cancelled" ? (
                <p className="text-xs text-frame-muted">{labels.paymentCancelled}</p>
              ) : null}
              <div>
                <label
                  htmlFor="checkout-phone"
                  className="mb-1 block text-xs font-medium text-frame-silver"
                >
                  {labels.phoneLabel}
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={labels.phonePlaceholder}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-white placeholder:text-frame-muted focus:border-frame-cyan focus:outline-none"
                />
                {phoneError ? (
                  <p className="mt-1 text-xs font-medium text-frame-magenta">{phoneError}</p>
                ) : null}
              </div>
              <Button
                onClick={handleContinue}
                disabled={busy}
                aria-busy={busy}
                className="w-full disabled:opacity-60"
              >
                {busy ? labels.payBusy : labels.payCta}
              </Button>
            </>
          )}
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-sm font-medium text-frame-magenta">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}
