import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

const FOUNDER_SITE_URL = "https://bybarzilay.com";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const { founder } = dict.about;

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {founder.title}
        </h1>
        <p className="mt-5 text-frame-silver">{founder.body}</p>
        <a
          href={FOUNDER_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-frame-cyan/60 px-5 py-2.5 text-sm font-semibold text-frame-cyan transition-colors hover:border-frame-cyan hover:text-white"
        >
          {founder.cta}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6">
        <Link
          href={localePath(locale, "/routines")}
          className="group inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
        >
          {dict.common.browseTutorials}
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
