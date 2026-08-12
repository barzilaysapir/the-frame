import { getFirebaseAuth } from "@/lib/firebase";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type LoginErrors = Dictionary["login"]["errors"];

export function getGoogleSignInErrorMessage(
  error: unknown,
  errors: LoginErrors,
): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return errors.popupClosed;
      case "auth/unauthorized-domain":
        return errors.unauthorizedDomain;
      case "auth/operation-not-allowed":
        return errors.providerDisabled;
      case "auth/popup-blocked":
        return errors.popupBlocked;
      case "auth/network-request-failed":
        return errors.network;
      default:
        return `${errors.generic} (${code ?? "unknown"})`;
    }
  }
  return errors.generic;
}

/** Open Google sign-in popup. Throws if Firebase isn’t configured or sign-in fails. */
export async function signInWithGoogle(): Promise<void> {
  const auth = await getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Auth is not configured");
  }
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  await signInWithPopup(auth, new GoogleAuthProvider());
}
