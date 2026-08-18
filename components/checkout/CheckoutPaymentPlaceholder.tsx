"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, which is a valid UI plan choice but not wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

interface PurchaseApiResponse {
  purchaseId: string;
  status: "pending" | "paid";
  checkoutUrl: string | null;
  providerConfigured: boolean;
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
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

export function CheckoutPaymentPlaceholder({
  locale,
  labels,
  loginErrors,
  continueGoogleLabel,
  paymentBody,
  itemType,
  itemSlug,
  planId,
  itemHref,
}: CheckoutPaymentPlaceholderProps) {
  const { user, loading, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);

  const planSupported = planId !== "subscription";

  const handlePay = async () => {
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
      if (data.checkoutUrl) {
        // Full navigation to an external hosted-checkout domain — a
        // client-side router.push can't cross origins, so this is the
        // correct choice here (unlike a same-origin redirect).
        window.location.href = data.checkoutUrl;
      }
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

          {result?.status === "paid" ? (
            <>
              <p className="text-sm font-medium text-white">{labels.alreadyOwned}</p>
              <Button href={itemHref} className="w-full">
                {labels.alreadyOwnedCta}
              </Button>
            </>
          ) : !planSupported ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.planUnavailable}
            </p>
          ) : result && !result.providerConfigured ? (
            <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
              {labels.providerNotConfigured}
            </p>
          ) : (
            <Button
              onClick={handlePay}
              disabled={busy}
              aria-busy={busy}
              className="w-full disabled:opacity-60"
            >
              {busy ? labels.payBusy : labels.payCta}
            </Button>
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
