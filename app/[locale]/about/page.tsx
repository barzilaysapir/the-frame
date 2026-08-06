import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

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

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.about.title}
        </h1>
        <p className="mt-5 text-frame-silver">{dict.about.body}</p>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {dict.about.values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-frame-border bg-frame-panel p-6 text-start"
            >
              <h2 className="font-display text-xl font-black text-white">
                {value.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-frame-silver">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href={localePath(locale, "/routines")}
            className="group inline-flex items-center gap-2 rounded-full bg-neon-cta px-6 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
          >
            {dict.common.browseTutorials}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
