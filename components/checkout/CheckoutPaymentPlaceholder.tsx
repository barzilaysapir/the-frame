"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { TermsDialog } from "@/components/checkout/TermsDialog";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import { startPurchaseStatusPoll } from "@/lib/client/poll-purchase-status";
import {
  checkoutAfterPurchase,
  submitUpayForm,
} from "@/lib/client/upay-checkout";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import {
  bitAmountAllowed,
  UPAY_BIT_MAX_ILS,
  type UpayPaymentMethod,
} from "@/lib/payments/upay-method";
import { toIsraeliMobileNational } from "@/lib/phone";
import { upayReturnErrorMessage } from "@/lib/payments/upay-return-error";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, a valid UI plan choice that isn't wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

/** The site's contact address, used as a mailto: fallback when no payment option is configured. */
const CONTACT_EMAIL = "theframe@bybarzilay.com";

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Card only — POST this hosted form. Bit never returns it. */
  upayForm?: { action: string; fields: Record<string, string> };
  bitRequested?: boolean;
}

interface CheckoutPaymentPlaceholderProps {
  locale: Locale;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
  termsDict: Dictionary["terms"];
  closeLabel: string;
  itemType: "lesson" | "external_course";
  itemSlug: string;
  planId: CheckoutPurchasePlanId;
  /** Server-computed plan price — used only to disable Bit above ₪5,000. */
  amountIls?: number;
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

/**
 * Card: POST uPay’s hosted form (returnurl brings the buyer back here).
 * Bit: the server requests the charge; we stay on the waiting UI and poll.
 */
export function CheckoutPaymentPlaceholder({
  locale,
  labels,
  loginErrors,
  continueGoogleLabel,
  termsDict,
  closeLabel,
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
  const upayReturnError = upayReturnErrorMessage(
    searchParams.get("errormessage"),
    searchParams.get("errordescription"),
    {
      userNotExists: labels.upayUserNotExists,
      paymentNotCompleted: labels.paymentNotCompleted,
    },
  );

  const [error, setError] = useState<string | null>(null);
  const [busyMethod, setBusyMethod] = useState<UpayPaymentMethod | null>(null);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [returnPaid, setReturnPaid] = useState(false);
  const [bitWaiting, setBitWaiting] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  const planSupported = planId !== "subscription";
  const owned = result?.status === "paid" || returnPaid;
  const busy = busyMethod !== null;
  const bitAllowed = amountIls == null || bitAmountAllowed(amountIls);
  const authPhone = user?.phoneNumber
    ? toIsraeliMobileNational(user.phoneNumber)
    : null;
  const phoneValue = phone ?? authPhone ?? "";

  // Browser return and Bit waiting are not proof of payment — poll
  // ownership (IPN / admin) until watch UI can take over.
  useEffect(() => {
    if (!user || owned) return;
    if (!bitWaiting && returnedFromPayment !== "success") return;
    return startPurchaseStatusPoll({
      check: async () => {
        const res = await fetchWithAuth(
          user,
          `/api/v1/me/purchases/status?itemType=${encodeURIComponent(itemType)}&itemSlug=${encodeURIComponent(itemSlug)}`,
        );
        if (!res.ok) return "none";
        const data = (await res.json()) as { status: "paid" | "none" };
        return data.status;
      },
      onPaid: () => setReturnPaid(true),
      timeoutMs: bitWaiting ? 180_000 : 120_000,
    });
  }, [user, owned, bitWaiting, returnedFromPayment, itemType, itemSlug]);

  const handlePay = async (paymentMethod: UpayPaymentMethod) => {
    if (!user) return;
    if (!termsAccepted) {
      setError(labels.termsRequired);
      return;
    }
    const payerPhone =
      paymentMethod === "bit" ? toIsraeliMobileNational(phoneValue) : null;
    if (paymentMethod === "bit" && !payerPhone) {
      setError(labels.phoneError);
      return;
    }
    if (paymentMethod === "bit" && !bitAllowed) {
      setError(formatMessage(labels.bitTooExpensive, { max: UPAY_BIT_MAX_ILS }));
      return;
    }
    setError(null);
    setBusyMethod(paymentMethod);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", `${pathname}${window.location.hash}`);
    }
    try {
      const res = await fetchWithAuth(user, "/api/v1/me/purchases", {
        method: "POST",
        body: JSON.stringify({
          itemType,
          itemSlug,
          planId,
          locale,
          returnPath: pathname,
          paymentMethod,
          phone: payerPhone ?? undefined,
        }),
      });
      if (!res.ok) {
        let message = labels.payError;
        try {
          const body = (await res.json()) as { error?: unknown };
          if (typeof body.error === "string" && body.error) message = body.error;
        } catch {
          /* keep payError */
        }
        setError(message);
        setBusyMethod(null);
        return;
      }
      const data = (await res.json()) as PurchaseApiResponse;
      const step = checkoutAfterPurchase(data);
      if (step.type === "redirect") {
        // Do not setState with upayForm — remounting a second <form>
        // aborts this POST (the 18 Aug Continue path).
        submitUpayForm(step.form.action, step.form.fields);
        return;
      }
      if (step.type === "bit-pending") {
        setBitWaiting(true);
        setBusyMethod(null);
        return;
      }
      setResult(data);
      setBusyMethod(null);
    } catch (err) {
      console.error("[CheckoutPaymentPlaceholder] purchase request failed:", err);
      setError(labels.payError);
      setBusyMethod(null);
    }
  };

  if (loading) {
    return (
      <Panel className="p-6 text-sm text-frame-silver">{labels.loading}</Panel>
    );
  }

  return (
    <Panel className="p-6">
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
          {owned ? (
            <>
              <p className="text-sm font-medium text-white">{labels.alreadyOwned}</p>
              <Button href={itemHref} className="w-full">
                {labels.alreadyOwnedCta}
              </Button>
            </>
          ) : bitWaiting ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">{labels.bitConfirmationTitle}</p>
              <p className="text-sm text-frame-silver">{labels.bitConfirmationBody}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setBitWaiting(false);
                  setError(null);
                }}
                className="w-full"
              >
                {labels.paymentNotCompleted}
              </Button>
            </div>
          ) : result ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.noPaymentMethod}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-frame-cyan underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          ) : !planSupported ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.planUnavailable}
            </p>
          ) : (
            <>
              {upayReturnError ? (
                <p role="alert" className="text-sm font-medium text-frame-magenta">
                  {upayReturnError}
                </p>
              ) : returnedFromPayment === "success" ? (
                <p className="text-xs text-frame-muted">{labels.paymentNotCompleted}</p>
              ) : null}
              {returnedFromPayment === "cancelled" ? (
                <p className="text-xs text-frame-muted">{labels.paymentCancelled}</p>
              ) : null}
              <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
                <label htmlFor="checkout-bit-phone" className="text-sm font-medium text-white">
                  {labels.phoneLabel}
                </label>
                <input
                  id="checkout-bit-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={labels.phonePlaceholder}
                  value={phoneValue}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-frame-border bg-frame-bg px-3 py-2 text-sm text-white outline-none focus:border-frame-cyan"
                />
                <p className="mt-2 text-xs text-frame-muted">{labels.bitHint}</p>
              </div>
              <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
                <div className="flex items-start gap-2 text-sm text-frame-silver">
                  <input
                    id="terms-accept"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-frame-border bg-frame-bg accent-frame-cyan"
                  />
                  <span>
                    <label htmlFor="terms-accept">{labels.termsPrefix}</label>{" "}
                    <TermsDialog
                      trigger={labels.termsLinkText}
                      dict={termsDict}
                      closeLabel={closeLabel}
                    />
                  </span>
                </div>
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-white">
                  {labels.payMethodLabel}
                </legend>
                <Button
                  onClick={() => void handlePay("card")}
                  disabled={busy || !termsAccepted}
                  aria-busy={busyMethod === "card"}
                  className="w-full disabled:opacity-60"
                >
                  {busyMethod === "card" ? labels.payBusy : labels.payCta}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handlePay("bit")}
                  disabled={busy || !termsAccepted || !bitAllowed}
                  aria-busy={busyMethod === "bit"}
                  className="w-full disabled:opacity-60"
                >
                  {busyMethod === "bit" ? labels.bitSending : labels.payWithBit}
                </Button>
                {!bitAllowed ? (
                  <p className="text-xs text-frame-muted">
                    {formatMessage(labels.bitTooExpensive, { max: UPAY_BIT_MAX_ILS })}
                  </p>
                ) : null}
              </fieldset>
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
