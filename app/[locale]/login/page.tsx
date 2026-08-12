"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase";
import { toIsraeliE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { isLocale } from "@/lib/i18n/config";
import {
  getDictionarySync,
  type Dictionary,
} from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

type PhoneStep = "enter-phone" | "enter-code";

function getErrorMessage(
  error: unknown,
  errors: Dictionary["login"]["errors"],
): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/invalid-phone-number":
        return errors.invalidPhone;
      case "auth/invalid-verification-code":
        return errors.invalidCode;
      case "auth/too-many-requests":
        return errors.tooMany;
      case "auth/popup-closed-by-user":
        return errors.popupClosed;
      default:
        return errors.generic;
    }
  }
  return errors.generic;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const labels = getDictionarySync(locale).login;
  const { user, loading, isConfigured } = useAuth();

  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter-phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(localePath(locale, "/account"));
    }
  }, [loading, user, router, locale]);

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
    };
  }, []);

  const handleSendCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!recaptchaContainerRef.current) return;
    const auth = await getFirebaseAuth();
    if (!auth) return;

    const e164 = toIsraeliE164(phoneNumber);
    if (!e164) {
      setError(labels.invalidPhoneInput);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          { size: "invisible" },
        );
      }
      const result = await signInWithPhoneNumber(
        auth,
        e164,
        recaptchaVerifierRef.current,
      );
      setConfirmationResult(result);
      setPhoneStep("enter-code");
    } catch (err) {
      setError(getErrorMessage(err, labels.errors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmationResult) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(code);
    } catch (err) {
      setError(getErrorMessage(err, labels.errors));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
        <h1 className="text-balance text-center font-display text-4xl font-black leading-[0.98] text-white">
          {labels.title}
        </h1>
        <p className="mt-3 text-center text-sm text-frame-silver">
          {labels.subtitle}
        </p>

        {!isConfigured ? (
          <div className="mt-8 rounded-2xl border border-frame-border bg-frame-panel p-6 text-center text-sm text-frame-silver">
            {labels.unavailable}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-frame-border bg-frame-panel p-6">
            <GoogleSignInButton
              label={labels.continueGoogle}
              errors={labels.errors}
              onError={setError}
            />

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-frame-border" />
              <span className="text-xs font-medium text-frame-muted">
                {labels.or}
              </span>
              <span className="h-px flex-1 bg-frame-border" />
            </div>

            {phoneStep === "enter-phone" ? (
              <form onSubmit={handleSendCode} className="flex flex-col gap-3">
                <label htmlFor="phone" className="text-sm font-medium text-white">
                  {labels.phoneLabel}
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="050-1234567"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-white placeholder:text-frame-muted focus:border-frame-cyan focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber}
                  className="mt-1"
                >
                  {isSubmitting ? labels.sendingCode : labels.sendCode}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                <label htmlFor="code" className="text-sm font-medium text-white">
                  {labels.codeLabel}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  placeholder="123456"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-frame-muted focus:border-frame-cyan focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || code.length < 4}
                  className="mt-1"
                >
                  {isSubmitting ? labels.verifying : labels.verifyCode}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("enter-phone");
                    setCode("");
                    setError(null);
                  }}
                  className="text-xs font-medium text-frame-muted hover:text-white"
                >
                  {labels.changePhone}
                </button>
              </form>
            )}

            {error ? (
              <p
                role="alert"
                className={cn("mt-4 text-sm font-medium text-frame-magenta")}
              >
                {error}
              </p>
            ) : null}
          </div>
        )}

        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>
    </main>
  );
}
