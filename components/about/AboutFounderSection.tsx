import { ArrowUpRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const FOUNDER_SITE_URL = "https://bybarzilay.com";

interface AboutFounderSectionProps {
  founder: Dictionary["about"]["founder"];
}

export function AboutFounderSection({ founder }: AboutFounderSectionProps) {
  return (
    <div className="mt-10 rounded-2xl border border-frame-border bg-frame-panel p-6 text-start sm:p-8">
      <h2 className="font-display text-2xl font-black text-white">
        {founder.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-frame-silver">
        {founder.body}
      </p>
      <a
        href={FOUNDER_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-frame-cyan/60 px-5 py-2.5 text-sm font-semibold text-frame-cyan transition-colors hover:border-frame-cyan hover:text-white"
      >
        {founder.cta}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
