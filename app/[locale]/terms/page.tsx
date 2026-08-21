import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TermsContent } from "@/components/legal/TermsContent";
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

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <TermsContent dict={dict.terms} />
      </div>
    </main>
  );
}
