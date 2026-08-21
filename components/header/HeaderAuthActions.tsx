import Link from "next/link";
import { LogIn } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface HeaderAuthActionsProps {
  locale: Locale;
  labels: Dictionary["nav"];
}

/** Desktop toolbar login — icon only; label via Tooltip. */
export function HeaderAuthActions({ locale, labels }: HeaderAuthActionsProps) {
  return (
    <Tooltip label={labels.login}>
      <Link
        href={localePath(locale, "/login")}
        aria-label={labels.login}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-frame-silver transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogIn className="h-5 w-5" aria-hidden />
      </Link>
    </Tooltip>
  );
}
