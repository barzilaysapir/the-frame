import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CourseLessonPlayer } from "@/components/CourseLessonPlayer";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { resolveCatalog } from "@/lib/server/catalog";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 5 minutes instead of refetching D1 on every request.
export const revalidate = 300;

interface ExternalCourseDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ExternalCourseDetailPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};

  const { repository } = await resolveCatalog();
  const course = await repository.getExternalCourse(localeParam, slug);
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

  const { repository } = await resolveCatalog();
  const course = await repository.getExternalCourse(locale, slug);
  if (!course) notFound();

  const hasLessons = course.lessons.length > 0;

  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <span className="inline-flex w-fit items-center rounded-full border border-frame-border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-frame-silver">
          {hasLessons
            ? dict.externalCourses.availableBadge
            : dict.externalCourses.comingSoonBadge}
        </span>

        <h1 className="mt-5 text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {course.title}
        </h1>
        <p className="mt-3 text-sm text-frame-silver">
          {formatMessage(dict.externalCourses.providerPrefix, {
            provider: course.provider,
          })}
        </p>

        {course.tagline ? (
          <p className="mt-5 text-lg text-frame-silver">{course.tagline}</p>
        ) : null}
        {course.description ? (
          <p className="mt-4 text-frame-silver">{course.description}</p>
        ) : null}

        <p className="mt-6 text-lg font-semibold text-white">
          {course.priceDisplay}
        </p>

        {!hasLessons ? (
          <p className="mt-2 text-sm text-frame-muted">
            {dict.externalCourses.comingSoonNote}
          </p>
        ) : null}
      </div>

      {hasLessons ? (
        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            {dict.externalCourses.lessonsHeading}
          </h2>
          <div className="flex flex-col gap-8">
            {course.lessons.map((lesson) => (
              <div key={lesson.id}>
                <p className="mb-3 text-sm font-semibold text-frame-silver">
                  {lesson.title}
                </p>
                <CourseLessonPlayer
                  courseSlug={course.slug}
                  lesson={lesson}
                  playerLabels={dict.player}
                  loginErrors={dict.login.errors}
                  labels={{
                    signInPrompt: dict.externalCourses.signInPrompt,
                    signInCta: dict.externalCourses.signInCta,
                    loading: dict.externalCourses.loadingVideo,
                    unavailable: dict.externalCourses.videoUnavailable,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6">
        <Link
          href={localePath(locale, "/routines")}
          className="group inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
        >
          {dict.externalCourses.back}
          <ArrowLeft className="h-3.5 w-3.5 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
