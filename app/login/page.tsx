"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
} from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { toIsraeliE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneStep = "enter-phone" | "enter-code";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/invalid-phone-number":
        return "מספר הטלפון לא תקין. נסו שוב עם מספר ישראלי מלא.";
      case "auth/invalid-verification-code":
        return "הקוד שהוזן שגוי. בדקו את ההודעה ונסו שוב.";
      case "auth/too-many-requests":
        return "יותר מדי ניסיונות. נסו שוב מאוחר יותר.";
      case "auth/popup-closed-by-user":
        return "החלון נסגר לפני השלמת ההתחברות.";
      default:
        return "משהו השתבש. נסו שוב.";
    }
  }
  return "משהו השתבש. נסו שוב.";
}

export default function LoginPage() {
  const router = useRouter();
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
      router.replace("/account");
    }
  }, [loading, user, router]);

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError(null);
    setIsSubmitting(true);
    try {
      // Navigation happens via the effect above once `user` updates, rather
      // than here, so we never redirect ahead of the shared auth state
      // (which would risk /account's own "sign in required" redirect
      // bouncing the user straight back before that state catches up).
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth || !recaptchaContainerRef.current) return;

    const e164 = toIsraeliE164(phoneNumber);
    if (!e164) {
      setError("הזינו מספר טלפון ישראלי תקין, לדוגמה 050-1234567.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          { size: "invisible" }
        );
      }
      const result = await signInWithPhoneNumber(
        auth,
        e164,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(result);
      setPhoneStep("enter-code");
    } catch (err) {
      setError(getErrorMessage(err));
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
      // See handleGoogleSignIn — navigation happens via the effect once
      // `user` updates, not immediately here.
      await confirmationResult.confirm(code);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
        <h1 className="text-balance text-center font-display text-4xl font-black leading-[0.98] text-white">
          התחברות
        </h1>
        <p className="mt-3 text-center text-sm text-frame-silver">
          התחברו כדי לגשת לרוטינות שרכשתם.
        </p>

        {!isConfigured ? (
          <div className="mt-8 rounded-2xl border border-frame-border bg-frame-panel p-6 text-center text-sm text-frame-silver">
            התחברות עדיין לא זמינה — האתר נמצא בבנייה. חזרו בקרוב.
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-frame-border bg-frame-panel p-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-frame-border bg-white px-5 py-3 text-sm font-semibold text-frame-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              המשיכו עם Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-frame-border" />
              <span className="text-xs font-medium text-frame-muted">או</span>
              <span className="h-px flex-1 bg-frame-border" />
            </div>

            {phoneStep === "enter-phone" ? (
              <form onSubmit={handleSendCode} className="flex flex-col gap-3">
                <label htmlFor="phone" className="text-sm font-medium text-white">
                  מספר טלפון
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
                <button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber}
                  className="mt-1 rounded-full bg-neon-cta px-5 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? "שולח קוד..." : "שלחו קוד אימות"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                <label htmlFor="code" className="text-sm font-medium text-white">
                  קוד אימות
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
                <button
                  type="submit"
                  disabled={isSubmitting || code.length < 4}
                  className="mt-1 rounded-full bg-neon-cta px-5 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? "מאמת..." : "אמתו קוד"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("enter-phone");
                    setCode("");
                    setError(null);
                  }}
                  className="text-xs font-medium text-frame-muted hover:text-white"
                >
                  שינוי מספר טלפון
                </button>
              </form>
            )}

            {error && (
              <p
                role="alert"
                className={cn("mt-4 text-sm font-medium text-frame-magenta")}
              >
                {error}
              </p>
            )}
          </div>
        )}

        {/* Invisible reCAPTCHA anchor required by Firebase phone auth */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>
    </main>
  );
}
