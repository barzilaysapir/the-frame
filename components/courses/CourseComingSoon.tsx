import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <span className="inline-flex w-fit items-center rounded-full border border-frame-border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-frame-silver">
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
        <p className="mt-6 text-lg font-semibold text-white">
          {course.priceDisplay}
        </p>
        <p className="mt-2 text-sm text-frame-muted">{labels.comingSoonNote}</p>
        <Link
          href={localePath(locale, "/routines")}
          className="group mt-10 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
        >
          {labels.back}
          <ArrowLeft className="h-3.5 w-3.5 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
