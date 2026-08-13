import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/account/UserAvatar";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface HeaderAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
  isAuthenticated: boolean;
  accountName: string;
  photoURL?: string | null;
  onSignOut: () => void;
}

/** Desktop toolbar auth block: sign-out + account avatar, or login + get-access CTA. */
export function HeaderAuthActions({
  locale,
  labels,
  isAuthenticated,
  accountName,
  photoURL,
  onSignOut,
}: HeaderAuthActionsProps) {
  if (isAuthenticated) {
    return (
      <>
        <button
          type="button"
          onClick={onSignOut}
          className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
        >
          {labels.signOut}
        </button>
        <Link
          href={localePath(locale, "/account")}
          className="transition-opacity hover:opacity-90"
          aria-label={labels.account}
        >
          <UserAvatar
            name={accountName}
            photoURL={photoURL}
            className="h-9 w-9 text-sm"
          />
        </Link>
      </>
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
