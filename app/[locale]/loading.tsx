"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

/**
 * Suspense fallback for every route under `[locale]`. Next.js swaps this in
 * immediately on navigation while the target page (most of which `await` D1
 * in the component body) streams in, instead of a frozen blank tab.
 */
export default function LocaleLoading() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-24">
      <div className="flex flex-col items-center gap-3 text-frame-silver">
        <Loader2 className="h-8 w-8 animate-spin text-frame-cyan" aria-hidden="true" />
        <span role="status" aria-live="polite" className="text-sm">
          {dict.common.loading}
        </span>
      </div>
    </main>
  );
}
