"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  getGoogleSignInErrorMessage,
  signInWithGoogle,
} from "@/lib/client/sign-in-with-google";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type LoginErrors = Dictionary["login"]["errors"];

interface GetAccessButtonProps {
  checkoutHref: string;
  label: string;
  loginErrors: LoginErrors;
  className?: string;
}

/**
 * Get-access CTA: if signed out, open Google first, then go to checkout
 * so the next page is payment-only.
 */
export function GetAccessButton({
  checkoutHref,
  label,
  loginErrors,
  className,
}: GetAccessButtonProps) {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    if (loading) return;

    if (user) {
      router.push(checkoutHref);
      return;
    }

    if (!isConfigured) {
      setError(loginErrors.generic);
      return;
    }

    setBusy(true);
    try {
      await signInWithGoogle();
      router.push(checkoutHref);
    } catch (err) {
      console.error("[Get access Google sign-in]", err);
      setError(getGoogleSignInErrorMessage(err, loginErrors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || loading}
        aria-busy={busy}
        className={cn(
          "flex w-full items-center justify-center rounded-full bg-neon-cta px-5 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110 disabled:opacity-60",
          className,
        )}
      >
        {label}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-center text-xs text-frame-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
}
