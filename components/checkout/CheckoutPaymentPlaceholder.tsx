"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { TermsDialog } from "@/components/checkout/TermsDialog";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { confirmCheckoutPurchase } from "@/lib/client/confirm-checkout-purchase";
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
  /** Present once Takbull is configured — navigate the buyer here (hosted checkout is a GET redirect). */
  checkoutUrl?: string;
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
 * Starts Takbull hosted checkout (see POST /api/v1/me/purchases and
 * lib/server/payments/takbull.ts) — the only payment gateway wired up.
 * app/[locale]/admin/purchases remains the manual override for edge cases
 * (missed webhook, refund).
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
  const returnedPurchaseId = searchParams.get("purchaseId");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [returnConfirm, setReturnConfirm] = useState<"pending" | "paid" | "unpaid">(
    "pending",
  );

  const planSupported = planId !== "subscription";
  const shouldConfirmReturn = Boolean(
    user && returnedFromPayment === "success" && returnedPurchaseId,
  );
  const confirmingReturn = shouldConfirmReturn && returnConfirm === "pending";
  const returnedPaid = returnConfirm === "paid";

  useEffect(() => {
    if (!user || returnedFromPayment !== "success" || !returnedPurchaseId) return;
    let cancelled = false;
    (async () => {
      const status = await confirmCheckoutPurchase(user, returnedPurchaseId);
      if (cancelled) return;
      setReturnConfirm(status === "paid" ? "paid" : "unpaid");
    })();
    return () => {
      cancelled = true;
    };
  }, [user, returnedFromPayment, returnedPurchaseId]);

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
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setResult(data);
      setBusy(false);
    } catch (err) {
      console.error("[CheckoutPaymentPlaceholder] purchase request failed:", err);
      setError(labels.payError);
      setBusy(false);
    }
  };

  if (loading || confirmingReturn) {
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
          {result?.status === "paid" || returnedPaid ? (
            <>
              <p className="text-sm font-medium text-white">{labels.alreadyOwned}</p>
              <Button href={itemHref} className="w-full">
                {labels.alreadyOwnedCta}
              </Button>
            </>
          ) : result ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.noPaymentMethod}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-frame-cyan underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          ) : returnedFromPayment === "success" ? (
            <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
              <p className="text-sm font-medium text-white">{labels.paymentConfirmationTitle}</p>
              <p className="mt-1 text-sm text-frame-silver">{labels.paymentConfirmationBody}</p>
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
