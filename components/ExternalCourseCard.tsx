import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface ExternalCourseCardProps {
  course: CatalogExternalCourse;
  locale: Locale;
  labels: {
    externalCourseTag: string;
    comingSoonBadge: string;
    availableBadge: string;
    providerPrefix: string;
    cta: string;
    linkAria: string;
  };
}

export function ExternalCourseCard({
  course,
  locale,
  labels,
}: ExternalCourseCardProps) {
  const hasLessons = course.lessons.length > 0;

  return (
    <Panel
      as={Link}
      href={localePath(locale, `/external-courses/${course.slug}`)}
      aria-label={formatMessage(labels.linkAria, {
        title: course.title,
        provider: course.provider,
      })}
      variant="interactive"
      className="group flex flex-col p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex w-fit items-center rounded-full bg-frame-magenta px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-frame-bg">
          {labels.externalCourseTag}
        </span>
        <span className="inline-flex w-fit items-center rounded-full border border-frame-border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-frame-silver">
          {hasLessons ? labels.availableBadge : labels.comingSoonBadge}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-black text-white">
        {course.title}
      </h3>
      <p className="mt-1 text-sm text-frame-silver">
        {formatMessage(labels.providerPrefix, { provider: course.provider })}
      </p>

      {course.tagline ? (
        <p className="mt-3 text-sm text-frame-silver">{course.tagline}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t border-frame-border pt-4">
        <span className="text-sm font-semibold text-white">
          {course.priceDisplay}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
          {labels.cta}
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 transition-transform ltr:rotate-180 group-hover:-translate-x-0.5" />
        </span>
      </div>
    </Panel>
  );
}
