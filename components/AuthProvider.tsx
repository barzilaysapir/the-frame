"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signOutUser: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  isConfigured: false,
  signOutUser: async () => {},
  updateDisplayName: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Skip the loading state entirely when Firebase isn't configured, so the
  // rest of the UI can render its signed-out state immediately.
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    Promise.all([getFirebaseAuth(), import("firebase/auth")]).then(
      ([auth, { onAuthStateChanged }]) => {
        if (!auth || cancelled) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        });
      },
    );

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signOutUser = async () => {
    const auth = await getFirebaseAuth();
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  };

  const updateDisplayName = async (displayName: string) => {
    const auth = await getFirebaseAuth();
    if (!auth?.currentUser) return;
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(auth.currentUser, { displayName });
    await auth.currentUser.reload();
    setUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signOutUser,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
