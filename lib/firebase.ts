"use client";

import type { Auth } from "firebase/auth";

/**
 * Trims whitespace from an env var. Some deployment pipelines (e.g. values
 * piped from a file or script) can leave a trailing newline baked into a
 * `NEXT_PUBLIC_*` value at build time, which silently corrupts anything built
 * from it — e.g. a trailing "\n" on `authDomain` breaks the Firebase Auth
 * helper-iframe URL and makes `signInWithPopup` fail with a raw, uncoded
 * "Illegal url for new iframe" error before any network request is made.
 */
function cleanEnv(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

/**
 * True once every required Firebase env var is present. Plain env var
 * checks — no SDK import — so this stays free to check synchronously
 * (e.g. to disable a sign-in button) without pulling in firebase/auth.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let authPromise: Promise<Auth | undefined> | undefined;

/**
 * Lazily loads and initializes Firebase Auth on first use instead of
 * bundling firebase/app + firebase/auth into every page's shared JS.
 * AuthProvider wraps the root layout, so without this, anonymous visitors
 * browsing the home page or catalog would pay for the auth SDK's weight
 * upfront even though only signed-in flows need it. Memoized so repeated
 * calls reuse the same dynamic import + initialized app/auth instance.
 */
export function getFirebaseAuth(): Promise<Auth | undefined> {
  if (!isFirebaseConfigured) return Promise.resolve(undefined);
  if (!authPromise) {
    authPromise = Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]).then(([{ getApps, initializeApp }, { getAuth }]) => {
      const app = getApps()[0] ?? initializeApp(firebaseConfig);
      return getAuth(app);
    });
  }
  return authPromise;
}
