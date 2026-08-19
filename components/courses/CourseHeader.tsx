import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import { CourseFeatureGrid } from "@/components/courses/CourseFeatureGrid";
import { CoursePromoVideo } from "@/components/courses/CoursePromoVideo";
import { CourseTags } from "@/components/courses/CourseTags";
import { CourseTopicChips } from "@/components/courses/CourseTopicChips";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseHeaderProps {
  course: CatalogExternalCourse;
  locale: Locale;
  labels: {
    back: string;
    externalCourseTag: string;
    taughtBy: string;
    promoLabel: string;
    promoPlaceholder: string;
  };
}

/**
 * Shared header for the external-course detail page's two pre-purchase
 * states (CourseLandingPreview, CourseComingSoon) — identical in both:
 * back link, tags, title, instructor credit, and promo clip (or a
 * placeholder until a real teaser exists — separate from gated lessons).
 */
export function CourseHeader({ course, locale, labels }: CourseHeaderProps) {
  return (
    <>
      <Link
        href={localePath(locale, "/routines")}
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
        {labels.back}
      </Link>
      <div className="text-center">
        <CourseTags
          course={course}
          locale={locale}
          externalCourseLabel={labels.externalCourseTag}
          className="justify-center"
        />
        <h1 className="mt-5 text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {course.title}
        </h1>
        <p className="mt-3 text-sm text-frame-silver">
          {labels.taughtBy}{" "}
          <Link
            href={localePath(locale, "/instructors")}
            className="font-medium text-white transition-colors hover:text-frame-cyan"
          >
            {course.provider}
          </Link>
        </p>
        {course.tagline ? (
          <p className="mt-5 text-lg text-frame-silver">{course.tagline}</p>
        ) : null}
        {course.description ? (
          <p className="mt-4 text-frame-silver">{course.description}</p>
        ) : null}
        <CourseTopicChips
          topics={course.curriculumTopics}
          className="mx-auto mt-6 max-w-lg justify-center"
        />
        <CourseFeatureGrid
          features={course.features}
          className="mx-auto mt-6 max-w-lg"
        />
        {course.promoVideo ? (
          <CoursePromoVideo
            src={course.promoVideo}
            poster={course.promoPoster ?? course.coverImage}
            label={formatMessage(labels.promoLabel, { title: course.title })}
            className="mt-10"
          />
        ) : (
          <div className="mt-10 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-frame-border bg-black/40 text-frame-muted">
            <Film className="h-10 w-10" aria-hidden="true" />
            <p className="text-sm">{labels.promoPlaceholder}</p>
          </div>
        )}
      </div>
    </>
  );
}
