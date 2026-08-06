"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

  if (!user) return null;

  const handleSignOut = async () => {
    await signOutUser();
    router.push(localePath(locale));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-frame-border bg-frame-panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-black text-white">
          {labels.languageTitle}
        </h2>
        <p className="mt-2 text-sm text-frame-silver">{labels.languageBody}</p>
        <div className="mt-4">
          <LanguageSwitcher locale={locale} label={languageLabel} />
        </div>
      </section>

      <section className="rounded-2xl border border-frame-border bg-frame-panel p-6 sm:p-8">
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
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 rounded-full border border-frame-border px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-frame-magenta hover:text-frame-magenta"
        >
          {labels.signOut}
        </button>
      </section>
    </div>
  );
}

export default SettingsPanel;
