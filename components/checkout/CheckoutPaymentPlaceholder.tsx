"use client";

import Link from "next/link";
import { useState } from "react";
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

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
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
 * Phase 1 payment: Bit only, manually confirmed by the site owner (see
 * app/[locale]/admin/purchases) — no payment-gateway integration yet.
 * "I've paid via Bit" just records a `pending` purchase; there's no
 * redirect, no webhook, no automatic confirmation.
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);

  const planSupported = planId !== "subscription";

  const handleMarkPaid = async () => {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetchWithAuth(user, "/api/v1/me/purchases", {
        method: "POST",
        body: JSON.stringify({ itemType, itemSlug, planId, locale }),
      });
      if (!res.ok) {
        throw new Error(`purchase request failed with ${res.status}`);
      }
      const data = (await res.json()) as PurchaseApiResponse;
      setResult(data);
    } catch (err) {
      console.error("[CheckoutPaymentPlaceholder] purchase request failed:", err);
      setError(labels.payError);
    } finally {
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

          {result ? (
            result.status === "paid" ? (
              <>
                <p className="text-sm font-medium text-white">{labels.alreadyOwned}</p>
                <Button href={itemHref} className="w-full">
                  {labels.alreadyOwnedCta}
                </Button>
              </>
            ) : (
              <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
                <p className="text-sm font-medium text-white">
                  {labels.bitConfirmationTitle}
                </p>
                <p className="mt-1 text-sm text-frame-silver">
                  {labels.bitConfirmationBody}
                </p>
              </div>
            )
          ) : !planSupported ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.planUnavailable}
            </p>
          ) : (
            <>
              <BitPaymentCard
                amountIls={amountIls}
                phone={BIT_PAYMENT_INFO}
                labels={labels.bitCard}
              />
              <p className="text-xs text-frame-muted">{labels.bitPaidIntro}</p>
              <Button
                onClick={handleMarkPaid}
                disabled={busy}
                aria-busy={busy}
                className="w-full disabled:opacity-60"
              >
                {busy ? labels.bitPaidBusy : labels.bitPaidCta}
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
