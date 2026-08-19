import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface HeaderAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
}

/**
 * Desktop toolbar CTA for signed-out visitors (login + get-access). Signed-in
 * users get the avatar dropdown (`UserMenu`) instead, rendered directly by
 * `Header` since it's shown at every breakpoint, not just desktop.
 */
export function HeaderAuthActions({ locale, labels }: HeaderAuthActionsProps) {
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
