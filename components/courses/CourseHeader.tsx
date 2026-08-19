import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import type { ReactNode } from "react";
import { CourseTags } from "@/components/courses/CourseTags";
import { cn } from "@/lib/utils";
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
    promoPlaceholder: string;
  };
  className?: string;
  children?: ReactNode;
}

/**
 * Shared header for the external-course detail page's two pre-purchase
 * states (CourseLandingPreview, CourseComingSoon) — identical in both:
 * back link, tags, title, and instructor credit. Each caller renders its
 * own state-specific content (checkout vs. price) via `children`.
 */
export function CourseHeader({
  course,
  locale,
  labels,
  className,
  children,
}: CourseHeaderProps) {
  return (
    <>
      <Link
        href={localePath(locale, "/routines")}
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
        {labels.back}
      </Link>
      <div className={cn("text-center", className)}>
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
        {/* Promo video — placeholder until a real teaser clip exists (separate from summary.mp4, which stays a gated lesson). */}
        <div className="mt-10 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-frame-border bg-black/40 text-frame-muted">
          <Film className="h-10 w-10" aria-hidden="true" />
          <p className="text-sm">{labels.promoPlaceholder}</p>
        </div>
        {children}
      </div>
    </>
  );
}
