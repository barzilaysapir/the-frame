import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseTags } from "@/components/courses/CourseTags";
import { CourseWatch } from "@/components/courses/CourseWatch";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseWatchPageProps {
  course: CatalogExternalCourse;
  locale: Locale;
  dict: Dictionary;
}

/** Post-purchase layout — the buyer already has access, so there's no purchase card/CTA to show, just the lessons. */
export function CourseWatchPage({ course, locale, dict }: CourseWatchPageProps) {
  const checkoutHref = localePath(locale, `/external-courses/${course.slug}`);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 lg:pb-16">
      <Link
        href={localePath(locale, "/routines")}
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
        {dict.common.backToLibrary}
      </Link>

      <section className="mb-8 max-w-3xl">
        <CourseTags
          course={course}
          locale={locale}
          externalCourseLabel={dict.externalCourses.tag}
          className="mb-4"
        />
        <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-3 text-sm text-frame-silver">
          {formatMessage(dict.tutorials.taughtBy, { name: course.provider })}
        </p>
        <p className="mt-4 text-sm font-medium text-frame-cyan">
          {dict.externalCourses.youOwnThis}
        </p>
      </section>

      <Suspense
        fallback={
          <div className="aspect-video w-full rounded-2xl border border-frame-border bg-black/40" />
        }
      >
        <CourseWatch
          courseSlug={course.slug}
          lessons={course.lessons}
          checkoutHref={checkoutHref}
          playerLabels={dict.player}
          loginErrors={dict.login.errors}
          lessonsHeading={dict.externalCourses.lessonsHeading}
          playerChrome={{
            signInPrompt: dict.externalCourses.signInPrompt,
            signInCta: dict.externalCourses.signInCta,
            loading: dict.externalCourses.loadingVideo,
            unavailable: dict.externalCourses.videoUnavailable,
            purchaseRequired: dict.externalCourses.purchaseRequired,
            purchaseRequiredCta: dict.externalCourses.purchaseRequiredCta,
          }}
        />
      </Suspense>
    </main>
  );
}
