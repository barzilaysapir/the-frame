"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

/** Mirrors `PurchasePlanId` in `lib/server/payments/price-resolver.ts` plus `"subscription"`, a valid UI plan choice that isn't wired to a real purchase yet (see that file for why). */
type CheckoutPurchasePlanId = "rental" | "course" | "course-credits" | "subscription";

/** The site's contact address, used as a mailto: fallback when no payment option is configured. */
const CONTACT_EMAIL = "sapir@bybarzilay.com";

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
  paymentBody: string;
  itemType: "lesson" | "external_course";
  itemSlug: string;
  planId: CheckoutPurchasePlanId;
  /** Where "watch now" / already-owned should link to. */
  itemHref: string;
}

/**
 * Submits uPay's dynamic payment form (see POST /api/v1/me/purchases and
 * lib/server/payments/upay.ts) — the only payment gateway wired up (Grow
 * was dropped once uPay's dynamic form was confirmed working with no
 * monthly fee, see #261's history). app/[locale]/admin/purchases remains
 * the manual override for edge cases (missed webhook, refund).
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
  itemHref,
}: CheckoutPaymentPlaceholderProps) {
  const { user, loading, isConfigured } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnedFromPayment = searchParams.get("payment");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PurchaseApiResponse | null>(null);
  const upayFormRef = useRef<HTMLFormElement>(null);

  const planSupported = planId !== "subscription";

  const handleContinue = async () => {
    if (!user) return;
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
                  <Button onClick={() => upayFormRef.current?.submit()} className="w-full">
                    {labels.payByCardCta}
                  </Button>
                  <p className="text-xs text-frame-muted">{labels.bitConfirmationBody}</p>
                </>
              ) : (
                <p className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-frame-muted">
                  {labels.noPaymentMethod}{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-frame-cyan underline">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              )}
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
