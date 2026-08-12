import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { notFound } from "next/navigation";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    // Bypasses the layout's "%s | The Frame by Barzilay" template — the
    // homepage title is already the full site title, not a page suffix.
    title: { absolute: dict.meta.siteTitle },
    description: dict.meta.siteDescription,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl">
          {dict.home.title}
        </h1>
        <p className="mt-5 max-w-xl text-frame-silver">{dict.home.subtitle}</p>
        <Link
          href={localePath(locale, "/routine/levitating")}
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neon-cta px-6 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
        >
          {dict.home.cta}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
