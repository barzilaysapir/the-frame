import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseAccessGate } from "@/components/courses/CourseAccessGate";
import { CourseComingSoon } from "@/components/courses/CourseComingSoon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { parsePriceIls } from "@/lib/pricing";
import { getCachedExternalCourse } from "@/lib/server/catalog";
import { resolveShareOrigin } from "@/lib/server/share-origin";
import { DEFAULT_SHARE_IMAGE, pageShareMetadata } from "@/lib/share-metadata";

export const revalidate = 3600;

interface ExternalCourseDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ExternalCourseDetailPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};

  const course = await getCachedExternalCourse(localeParam, slug);
  if (!course) return {};

  const origin = await resolveShareOrigin();
  return pageShareMetadata({
    title: course.title,
    description: course.description || course.tagline,
    image: course.coverImage || DEFAULT_SHARE_IMAGE,
    imageAlt: course.title,
    origin,
  });
}

export default async function ExternalCourseDetailPage({
  params,
}: ExternalCourseDetailPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);

  const course = await getCachedExternalCourse(locale, slug);
  if (!course) notFound();

  const priceIls = parsePriceIls(course.priceDisplay);
  if (priceIls == null) {
    return (
      <CourseComingSoon
        course={course}
        locale={locale}
        labels={{
          taughtBy: dict.routine.taughtBy,
          back: dict.common.backToLibrary,
          externalCourseTag: dict.externalCourses.tag,
          promoLabel: dict.externalCourses.promoLabel,
          promoPlaceholder: dict.externalCourses.promoPlaceholder,
        }}
      />
    );
  }

  return (
    <CourseAccessGate
      course={course}
      locale={locale}
      priceIls={priceIls}
      dict={dict}
    />
  );
}
