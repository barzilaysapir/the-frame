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
import {
  checkoutAfterPurchase,
  submitUpayForm,
} from "@/lib/client/upay-checkout";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { upayReturnErrorMessage } from "@/lib/payments/upay-return-error";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, a valid UI plan choice that isn't wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

/** The site's contact address, used as a mailto: fallback when no payment option is configured. */
const CONTACT_EMAIL = "theframe@bybarzilay.com";

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present for card checkout — the client POSTs this form to uPay. */
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
  /** Server-computed plan price (display / future Bit; unused while card-only). */
  amountIls?: number;
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

/**
 * Card-only for now: POST uPay’s hosted form, then return to this course.
 * Bit is parked until a PSP with a working phone-charge API (e.g. Grow).
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
  const upayReturnError = upayReturnErrorMessage(
    searchParams.get("errormessage"),
    searchParams.get("errordescription"),
    {
      userNotExists: labels.upayUserNotExists,
      paymentNotCompleted: labels.paymentNotCompleted,
    },
  );

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [returnPaid, setReturnPaid] = useState(false);

  const planSupported = planId !== "subscription";
  const owned = result?.status === "paid" || returnPaid;

  // After a uPay returnurl, poll ownership. Query-string “success” is not proof.
  useEffect(() => {
    if (!user || returnPaid) return;
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
  }, [user, returnPaid, itemType, itemSlug]);

  const handlePay = async () => {
    if (!user) return;
    if (!termsAccepted) {
      setError(labels.termsRequired);
      return;
    }
    setError(null);
    setBusy(true);
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
          paymentMethod: "card",
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
        setBusy(false);
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
                onClick={() => void handlePay()}
                disabled={busy || !termsAccepted}
                aria-busy={busy}
                className="w-full disabled:opacity-60"
              >
                {busy ? labels.payBusy : labels.payWithCard}
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
