"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { TermsDialog } from "@/components/checkout/TermsDialog";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, a valid UI plan choice that isn't wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

/** The site's contact address, used as a mailto: fallback when no payment option is configured. */
const CONTACT_EMAIL = "theframe@bybarzilay.com";

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present once uPay is configured — must be submitted as a real POST form (uPay's endpoint isn't a plain redirect link), see the hidden form below. */
  upayForm?: { action: string; fields: Record<string, string> };
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
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

/**
 * Submits uPay's card payment form (see POST /api/v1/me/purchases).
 * Bit is not offered here — uPay rejected paymentmethod=bit and the
 * providername=bit attempt did not restore a working Bit checkout.
 * app/[locale]/admin/purchases remains the manual override if IPN misses.
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
  itemHref,
}: CheckoutPaymentPlaceholderProps) {
  const { user, loading, isConfigured } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnedFromPayment = searchParams.get("payment");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [returnPaid, setReturnPaid] = useState(false);
  const upayFormRef = useRef<HTMLFormElement>(null);

  const planSupported = planId !== "subscription";
  const owned = result?.status === "paid" || returnPaid;

  // uPay's returnurl always appends ?payment=success. That is not proof of
  // payment — poll ownership and keep the pay buttons so a failed/cancelled
  // return is not a dead end.
  useEffect(() => {
    if (!user || returnedFromPayment !== "success") return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetchWithAuth(
          user,
          `/api/v1/me/purchases/status?itemType=${encodeURIComponent(itemType)}&itemSlug=${encodeURIComponent(itemSlug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { status: "paid" | "none" };
        if (!cancelled && data.status === "paid") setReturnPaid(true);
      } catch (err) {
        console.error("[CheckoutPaymentPlaceholder] return status check failed:", err);
      }
    };
    void check();
    const interval = setInterval(check, 2500);
    const stop = setTimeout(() => clearInterval(interval), 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [user, returnedFromPayment, itemType, itemSlug]);

  // Submit the hosted form as soon as fields arrive so the buyer isn't asked
  // to click a second time.
  useEffect(() => {
    if (result?.upayForm) {
      upayFormRef.current?.submit();
    }
  }, [result]);

  const handleContinue = async () => {
    if (!user) return;
    if (!termsAccepted) {
      setError(labels.termsRequired);
      return;
    }
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
          ) : result?.upayForm ? (
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
              <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-silver">
                {labels.payBusy}
              </p>
            </>
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
              {returnedFromPayment === "success" ? (
                <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
                  <p className="text-sm font-medium text-white">{labels.bitConfirmationTitle}</p>
                  <p className="mt-1 text-sm text-frame-silver">{labels.bitConfirmationBody}</p>
                </div>
              ) : null}
              {returnedFromPayment === "cancelled" ? (
                <p className="text-xs text-frame-muted">{labels.paymentCancelled}</p>
              ) : null}
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
              <Button
                onClick={handleContinue}
                disabled={busy || !termsAccepted}
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
