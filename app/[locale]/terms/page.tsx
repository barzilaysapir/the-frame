import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.terms.metaTitle,
    description: dict.terms.metaDescription,
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const { title, updated, intro, sections } = dict.terms;

  return (
    <main className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-frame-muted">{updated}</p>
        <p className="mt-6 text-frame-silver">{intro}</p>

        <div className="mt-10 space-y-8">
          {Object.values(sections).map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-black text-white">
                {section.title}
              </h2>
              <p className="mt-2 text-frame-silver">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
