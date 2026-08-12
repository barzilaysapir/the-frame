import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface MobileMenuAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
  isAuthenticated: boolean;
  onCloseMenu: () => void;
  onSignOut: () => void;
}

/** Mobile menu auth block: account link + sign-out, or login + get-access link. */
export function MobileMenuAuthActions({
  locale,
  labels,
  isAuthenticated,
  onCloseMenu,
  onSignOut,
}: MobileMenuAuthActionsProps) {
  if (isAuthenticated) {
    return (
      <>
        <Link
          href={localePath(locale, "/account")}
          onClick={onCloseMenu}
          className="rounded-lg px-3 py-3 text-center text-base font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
        >
          {labels.account}
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full bg-neon-cta px-3 py-3 text-center text-base font-semibold text-frame-bg touch-manipulation hover:brightness-110"
        >
          {labels.signOut}
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href={localePath(locale, "/login")}
        onClick={onCloseMenu}
        className="rounded-lg px-3 py-3 text-center text-base font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
      >
        {labels.login}
      </Link>
      <Link
        href={localePath(locale, "/routines")}
        onClick={onCloseMenu}
        className="rounded-full bg-neon-cta px-3 py-3 text-center text-base font-semibold text-frame-bg hover:brightness-110"
      >
        {labels.getAccess}
      </Link>
    </>
  );
}
