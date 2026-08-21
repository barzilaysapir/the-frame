import { Check } from "lucide-react";
import { RoutineFilterTag } from "@/components/routines/RoutineFilterTag";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

type CourseTagsSize = "sm" | "md";

interface CourseTagsProps {
  course: CatalogExternalCourse;
  locale: Locale;
  size?: CourseTagsSize;
  externalCourseLabel: string;
  className?: string;
  /** Compact “you have access” pill — watch page only, not the public landing. */
  accessLabel?: string;
  /** When tags sit on a clickable card overlay, re-enable pointer events on the pills. */
  overlay?: boolean;
}

const sizeClass: Record<CourseTagsSize, string> = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1 text-xs",
};

export function CourseTags({
  course,
  locale,
  size = "md",
  externalCourseLabel,
  className,
  accessLabel,
  overlay = false,
}: CourseTagsProps) {
  const interactive = overlay ? "pointer-events-auto" : undefined;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {course.style ? (
        <RoutineFilterTag
          value={course.style}
          variant="style"
          size={size}
          locale={locale}
          className={interactive}
        />
      ) : null}
      {course.level ? (
        <RoutineFilterTag
          value={course.level}
          variant="level"
          size={size}
          locale={locale}
          className={interactive}
        />
      ) : null}
      <span
        className={cn(
          "rounded-full bg-frame-cyan font-bold text-frame-bg",
          sizeClass[size],
        )}
      >
        {externalCourseLabel}
      </span>
      {accessLabel ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-frame-cyan/70 bg-frame-cyan/15 font-bold text-frame-cyan",
            sizeClass[size],
          )}
        >
          <Check className="h-3 w-3" aria-hidden="true" />
          {accessLabel}
        </span>
      ) : null}
    </div>
  );
}
