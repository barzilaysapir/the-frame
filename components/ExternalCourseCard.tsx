import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { CourseTags } from "@/components/courses/CourseTags";
import { Panel } from "@/components/ui/Panel";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface ExternalCourseCardProps {
  course: CatalogExternalCourse;
  locale: Locale;
  /** Set for above-the-fold cards (first grid row) to improve LCP. */
  priority?: boolean;
  labels: {
    externalCourseTag: string;
    taughtBy: string;
    cta: string;
    linkAria: string;
  };
}

export function ExternalCourseCard({
  course,
  locale,
  priority = false,
  labels,
}: ExternalCourseCardProps) {
  return (
    <Panel
      as="article"
      variant="interactive"
      className="group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Link
          href={localePath(locale, `/external-courses/${course.slug}`)}
          className="absolute inset-0 block"
          aria-label={formatMessage(labels.linkAria, {
            title: course.title,
            provider: course.provider,
          })}
        >
          <Image
            src={course.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
          <CourseTags
            course={course}
            locale={locale}
            size="sm"
            overlay
            externalCourseLabel={labels.externalCourseTag}
          />
        </div>
      </div>

      <Link
        href={localePath(locale, `/external-courses/${course.slug}`)}
        className="flex flex-1 flex-col p-6"
      >
        <h3 className="font-display text-xl font-black text-white">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-frame-silver">
          {formatMessage(labels.taughtBy, { name: course.provider })}
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
      </Link>
    </Panel>
  );
}
