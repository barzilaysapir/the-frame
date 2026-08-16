import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
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
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="max-w-xl text-frame-silver">{dict.home.subtitle}</p>
        <h1 className="mt-5 text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl">
          {dict.home.title}
        </h1>
        <Button
          href={localePath(locale, "/routines")}
          className="group mt-9 px-6"
        >
          {dict.common.browseTutorials}
          <ArrowLeft className="h-4 w-4 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Button>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {dict.whoItsFor.items.map((item) => (
            <Panel key={item.title} className="p-6 text-start">
              <h3 className="font-display text-lg font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm text-frame-silver">
                {item.body}
              </p>
            </Panel>
          ))}
        </div>
      </div>
    </main>
  );
}
