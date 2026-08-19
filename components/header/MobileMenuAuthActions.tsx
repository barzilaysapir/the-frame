import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface MobileMenuAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
  onCloseMenu: () => void;
}

/**
 * Mobile menu CTA for signed-out visitors (login + get-access). Signed-in
 * users get the always-visible avatar dropdown instead (see `Header`), so
 * this never renders for them.
 */
export function MobileMenuAuthActions({
  locale,
  labels,
  onCloseMenu,
}: MobileMenuAuthActionsProps) {
  return (
    <>
      <Link
        href={localePath(locale, "/login")}
        onClick={onCloseMenu}
        className="rounded-lg px-3 py-3 text-center text-base font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
      >
        {labels.login}
      </Link>
      <Button
        href={localePath(locale, "/routines")}
        onClick={onCloseMenu}
        className="px-3 py-3 text-base"
      >
        {labels.getAccess}
      </Button>
    </>
  );
}
