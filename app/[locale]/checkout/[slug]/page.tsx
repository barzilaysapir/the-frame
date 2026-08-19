import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import { getCachedExternalCourse, getCachedRoutine } from "@/lib/server/catalog";

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

/**
 * Checkout no longer has its own page for either item type — the plan
 * picker + payment flow is merged directly into the routine/course detail
 * page (see RoutinePage / CourseLandingPreview). This route only exists to
 * redirect old checkout links to the right detail page.
 */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();

  const routine = await getCachedRoutine(localeParam, slug);
  if (routine) {
    redirect(localePath(localeParam, `/routine/${routine.slug}#checkout`));
  }

  const course = await getCachedExternalCourse(localeParam, slug);
  if (!course || course.lessons.length === 0) {
    notFound();
  }
  redirect(localePath(localeParam, `/external-courses/${course.slug}`));
}
