import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseTags } from "@/components/courses/CourseTags";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseComingSoonProps {
  course: CatalogExternalCourse;
  locale: Locale;
  labels: {
    comingSoonBadge: string;
    comingSoonNote: string;
    taughtBy: string;
    back: string;
    externalCourseTag: string;
  };
}

export function CourseComingSoon({
  course,
  locale,
  labels,
}: CourseComingSoonProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <Link
          href={localePath(locale, "/routines")}
          className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
          {labels.back}
        </Link>
        <div className="py-8 text-center sm:py-14">
        <CourseTags
          course={course}
          locale={locale}
          externalCourseLabel={labels.externalCourseTag}
          className="justify-center"
        />
        <span className="mx-auto mt-4 inline-flex w-fit items-center rounded-full border border-frame-border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-frame-silver">
          {labels.comingSoonBadge}
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {course.title}
        </h1>
        <p className="mt-3 text-sm text-frame-silver">
          {formatMessage(labels.taughtBy, { name: course.provider })}
        </p>
        {course.tagline ? (
          <p className="mt-5 text-lg text-frame-silver">{course.tagline}</p>
        ) : null}
        {course.description ? (
          <p className="mt-4 text-frame-silver">{course.description}</p>
        ) : null}
        {course.highlights.length > 0 ? (
          <ul className="mx-auto mt-6 max-w-lg space-y-3 text-start">
            {course.highlights.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-2.5 text-sm text-frame-silver"
              >
                <span className="text-frame-silver">—</span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-6 text-lg font-semibold text-white">
          {course.priceDisplay}
        </p>
        <p className="mt-2 text-sm text-frame-muted">{labels.comingSoonNote}</p>
        </div>
      </div>
    </main>
  );
}
