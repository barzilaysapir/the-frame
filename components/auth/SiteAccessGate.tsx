"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface SiteAccessGateProps {
  children: ReactNode;
  labels: Dictionary["siteAccess"];
  loginErrors: Dictionary["login"]["errors"];
}

/**
 * Soft site gate: when the server says access is restricted, block chrome +
 * pages until a Google account on SITE_ACCESS_EMAILS proves itself via
 * `/api/v1/me` (server enforces the same list in `requireFirebaseClaims`).
 */
export function SiteAccessGate({
  children,
  labels,
  loginErrors,
}: SiteAccessGateProps) {
  const { user, loading: authLoading, isConfigured, signOutUser } = useAuth();
  const [access, setAccess] = useState<"unknown" | "allowed" | "denied">(
    "unknown",
  );
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAccess("unknown");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithAuth(user, "/api/v1/me");
        if (cancelled) return;
        if (res.status === 403) {
          setAccess("denied");
          return;
        }
        if (!res.ok) {
          throw new Error(`site-access check failed with ${res.status}`);
        }
        setAccess("allowed");
      } catch (error) {
        if (cancelled) return;
        console.error("[SiteAccessGate] access check failed:", error);
        setAccess("denied");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (access === "allowed") {
    return children;
  }

  if (authLoading || (user && access === "unknown")) {
    return (
      <GateFrame>
        <p className="text-sm text-frame-silver">{labels.loading}</p>
      </GateFrame>
    );
  }

  if (!isConfigured) {
    return (
      <GateFrame>
        <p className="text-sm text-frame-silver">{labels.unavailable}</p>
      </GateFrame>
    );
  }

  if (user && access === "denied") {
    return (
      <GateFrame>
        <h1 className="font-display text-2xl font-black text-white">
          {labels.title}
        </h1>
        <p className="text-sm text-frame-silver">{labels.notAllowed}</p>
        <Button
          type="button"
          className="w-fit px-6"
          onClick={() => {
            void signOutUser();
          }}
        >
          {labels.signOut}
        </Button>
      </GateFrame>
    );
  }

  return (
    <GateFrame>
      <h1 className="font-display text-2xl font-black text-white">
        {labels.title}
      </h1>
      <p className="text-sm text-frame-silver">{labels.signInPrompt}</p>
      <div className="w-full max-w-xs">
        <GoogleSignInButton
          label={labels.signInCta}
          errors={loginErrors}
          onError={setSignInError}
        />
      </div>
      {signInError ? (
        <p className="text-sm text-red-400" role="alert">
          {signInError}
        </p>
      ) : null}
    </GateFrame>
  );
}

function GateFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      {children}
    </div>
  );
}
