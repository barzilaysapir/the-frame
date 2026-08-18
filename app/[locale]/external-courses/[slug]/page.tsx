import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseAccessGate } from "@/components/courses/CourseAccessGate";
import { CourseComingSoon } from "@/components/courses/CourseComingSoon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { parsePriceIls } from "@/lib/pricing";
import { getCachedExternalCourse } from "@/lib/server/catalog";

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

  return {
    title: course.title,
    description: course.description || course.tagline,
  };
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

  const hasLessons = course.lessons.length > 0;

  if (!hasLessons) {
    return (
      <CourseComingSoon
        course={course}
        locale={locale}
        labels={{
          comingSoonBadge: dict.externalCourses.comingSoonBadge,
          comingSoonNote: dict.externalCourses.comingSoonNote,
          taughtBy: dict.tutorials.taughtBy,
          back: dict.common.backToLibrary,
          externalCourseTag: dict.externalCourses.tag,
        }}
      />
    );
  }

  const priceIls = parsePriceIls(course.priceDisplay);
  if (priceIls == null) notFound();

  return (
    <CourseAccessGate
      course={course}
      locale={locale}
      priceIls={priceIls}
      dict={dict}
    />
  );
}
