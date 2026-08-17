"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { isLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";

interface SettingsPanelProps {
  labels: Dictionary["account"]["settings"];
  languageLabel: string;
}

export function SettingsPanel({ labels, languageLabel }: SettingsPanelProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const { user, signOutUser } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOutUser();
      router.push(localePath(locale));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel as="section" className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-black text-white">
          {labels.languageTitle}
        </h2>
        <p className="mt-2 text-sm text-frame-silver">{labels.languageBody}</p>
        <div className="mt-4">
          <LanguageSwitcher locale={locale} label={languageLabel} />
        </div>
      </Panel>

      <Panel as="section" className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-black text-white">
          {labels.sessionTitle}
        </h2>
        <p className="mt-2 text-sm text-frame-silver">{labels.sessionBody}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-2 border-b border-frame-border/60 py-2">
            <dt className="text-frame-muted">{labels.signedInAs}</dt>
            <dd className="font-medium text-white">
              {user.displayName || user.email || user.phoneNumber}
            </dd>
          </div>
          {user.email ? (
            <div className="flex flex-wrap justify-between gap-2 border-b border-frame-border/60 py-2">
              <dt className="text-frame-muted">{labels.email}</dt>
              <dd dir="ltr" className="font-medium text-white">
                {user.email}
              </dd>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-2 py-2">
            <dt className="text-frame-muted">{labels.uid}</dt>
            <dd dir="ltr" className="truncate font-mono text-xs text-frame-silver">
              {user.uid}
            </dd>
          </div>
        </dl>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-busy={isSigningOut}
          className="mt-6"
        >
          {labels.signOut}
        </Button>
      </Panel>
    </div>
  );
}
