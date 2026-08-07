"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

interface CheckoutPaymentPlaceholderProps {
  locale: Locale;
  labels: Dictionary["checkout"];
  loginErrors: Dictionary["login"]["errors"];
  continueGoogleLabel: string;
  paymentBody: string;
  guarantees: string[];
}

export function CheckoutPaymentPlaceholder({
  locale,
  labels,
  loginErrors,
  continueGoogleLabel,
  paymentBody,
  guarantees,
}: CheckoutPaymentPlaceholderProps) {
  const { user, loading, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-frame-border bg-frame-panel p-6 text-sm text-frame-silver">
        {labels.loading}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-frame-border bg-frame-panel p-6">
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
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-neon-cta px-5 py-3 text-sm font-semibold text-frame-bg opacity-50"
          >
            {labels.payCta}
          </button>
          <p className="text-xs text-frame-muted">{labels.paySoon}</p>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-sm font-medium text-frame-magenta">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3 border-t border-frame-border pt-6">
        {guarantees.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-2.5 text-sm text-frame-silver"
          >
            <span className="text-frame-silver">—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CheckoutPaymentPlaceholder;
