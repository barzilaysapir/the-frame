import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "@/components/header/UserMenu";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface HeaderAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
  settingsLabel: string;
  isAuthenticated: boolean;
  accountName: string;
  photoURL?: string | null;
  onSignOut: () => void;
}

/** Desktop toolbar auth block: avatar dropdown menu, or login + get-access CTA. */
export function HeaderAuthActions({
  locale,
  labels,
  settingsLabel,
  isAuthenticated,
  accountName,
  photoURL,
  onSignOut,
}: HeaderAuthActionsProps) {
  if (isAuthenticated) {
    return (
      <UserMenu
        locale={locale}
        labels={{
          account: labels.account,
          favorites: labels.favorites,
          settings: settingsLabel,
          signOut: labels.signOut,
          language: labels.language,
        }}
        accountName={accountName}
        photoURL={photoURL}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <>
      <Link
        href={localePath(locale, "/login")}
        className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
      >
        {labels.login}
      </Link>
      <Button
        href={localePath(locale, "/routines")}
        className="group gap-1.5 px-4 py-2"
      >
        {labels.getAccess}
        <ArrowLeft className="h-3.5 w-3.5 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
      </Button>
    </>
  );
}
