"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

/** Root-level fallback (mirrors `app/not-found.tsx`) for the rare error thrown above locale routing. */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const dict = getDictionarySync("he");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center sm:px-6">
        <AlertTriangle
          className="h-14 w-14 text-frame-magenta"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-balance font-display text-3xl font-black leading-[0.98] text-white sm:text-4xl">
          {dict.error.title}
        </h1>
        <p className="mt-4 max-w-md text-frame-silver">{dict.error.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => retry()} className="px-6">
            {dict.error.retry}
          </Button>
          <Button href="/he" variant="secondary" className="group px-6">
            {dict.common.home}
            <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
          </Button>
        </div>
      </div>
    </main>
  );
}
