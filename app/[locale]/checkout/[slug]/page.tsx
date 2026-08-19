import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { CheckoutPlans } from "@/components/checkout/CheckoutPlans";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import {
  getCachedExternalCourse,
  getCachedInstructor,
  getCachedRoutine,
} from "@/lib/server/catalog";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 1 hour instead of refetching D1 on every request.
export const revalidate = 3600;

interface CheckoutPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};
  const dict = await getDictionary(localeParam);
  const routine = await getCachedRoutine(localeParam, slug);
  if (routine) {
    return {
      title: `${dict.checkout.metaTitle} — ${routine.title}`,
    };
  }
  const course = await getCachedExternalCourse(localeParam, slug);
  if (!course) return {};
  return {
    title: `${dict.checkout.metaTitle} — ${course.title}`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();

  const dict = await getDictionary(localeParam);

  const routine = await getCachedRoutine(localeParam, slug);
  if (routine) {
    const instructor = await getCachedInstructor(
      localeParam,
      routine.instructorSlug,
    );

    return (
      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:py-16">
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
        <p className="mt-3 text-frame-silver">{dict.checkout.subtitle}</p>

        <div className="mt-10">
          <CheckoutPlans
            locale={localeParam}
            routineSlug={routine.slug}
            routineTitle={routine.title}
            instructorName={instructor?.name}
            taughtByLabel={dict.routine.taughtBy}
            rentalOriginalPrice={routine.pricing.original}
            rentalPrice={routine.pricing.earlyBird}
            labels={dict.checkout}
            loginErrors={dict.login.errors}
            continueGoogleLabel={dict.login.continueGoogle}
            termsDict={dict.terms}
            closeLabel={dict.common.close}
          />
        </div>
      </main>
    );
  }

  // External-course checkout now lives directly on the course page itself
  // (plan picker + payment merged into CourseLandingPreview) — this route
  // only still exists for routines above; redirect old course-checkout
  // links instead of duplicating that flow.
  const course = await getCachedExternalCourse(localeParam, slug);
  if (!course || course.lessons.length === 0) {
    notFound();
  }
  redirect(localePath(localeParam, `/external-courses/${course.slug}`));
}
