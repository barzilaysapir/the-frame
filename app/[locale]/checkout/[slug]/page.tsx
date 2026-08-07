import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutPaymentPlaceholder } from "@/components/checkout/CheckoutPaymentPlaceholder";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import { resolveCatalog } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};
  const { repository } = await resolveCatalog();
  const routine = await repository.getRoutine(localeParam, slug);
  if (!routine) return {};
  const dict = await getDictionary(localeParam);
  return {
    title: `${dict.checkout.metaTitle} — ${routine.title}`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();

  const dict = await getDictionary(localeParam);
  const { repository } = await resolveCatalog();

  const routine = await repository.getRoutine(localeParam, slug);
  if (!routine) notFound();

  const instructor = await repository.getInstructor(
    localeParam,
    routine.instructorSlug,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Link
        href={localePath(localeParam, `/routine/${routine.slug}`)}
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-frame-silver transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
        {dict.checkout.backToRoutine}
      </Link>

      <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
        {dict.checkout.title}
      </h1>
      <p className="mt-3 max-w-xl text-frame-silver">{dict.checkout.subtitle}</p>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <CheckoutOrderSummary
          locale={localeParam}
          title={routine.title}
          artist={routine.artist}
          style={routine.style}
          level={routine.level}
          poster={routine.poster}
          instructorName={instructor?.name ?? ""}
          instructorAvatar={instructor?.avatar}
          taughtByLabel={dict.routine.taughtBy}
          originalPrice={routine.pricing.original}
          discountedPrice={routine.pricing.earlyBird}
          pricingNote={dict.routine.pricingNote}
        />

        <CheckoutPaymentPlaceholder
          locale={localeParam}
          labels={dict.checkout}
          loginErrors={dict.login.errors}
          continueGoogleLabel={dict.login.continueGoogle}
        />
      </div>
    </main>
  );
}
