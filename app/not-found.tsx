import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function NotFound() {
  const dict = getDictionarySync("he");

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center sm:px-6">
        <span className="font-display text-7xl font-black text-frame-magenta">
          404
        </span>
        <h1 className="mt-4 text-balance font-display text-3xl font-black leading-[0.98] text-white sm:text-4xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-4 max-w-md text-frame-silver">{dict.notFound.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/he"
            className="group inline-flex items-center gap-2 rounded-full bg-neon-cta px-6 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
          >
            {dict.common.home}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <Link
            href="/he/routines"
            className="rounded-full border border-frame-border px-6 py-3 text-sm font-semibold text-frame-silver transition-colors hover:border-white/40 hover:text-white"
          >
            {dict.common.browseTutorials}
          </Link>
        </div>
      </div>
    </main>
  );
}
