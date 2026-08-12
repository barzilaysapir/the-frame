"use client";

import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const firebaseConfig: FirebaseOptions = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

/**
 * True once every required Firebase env var is present. Auth UI checks this
 * before touching the SDK so local/dev/preview builds without a configured
 * Firebase project degrade gracefully instead of throwing at import time.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

const firebaseApp = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : undefined;

export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
