import { CourseHeader } from "@/components/courses/CourseHeader";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseComingSoonProps {
  course: CatalogExternalCourse;
  locale: Locale;
  labels: {
    taughtBy: string;
    back: string;
    externalCourseTag: string;
    promoPlaceholder: string;
  };
}

export function CourseComingSoon({
  course,
  locale,
  labels,
}: CourseComingSoonProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Content here is shorter than CourseLandingPreview (no checkout
          below the header) — .neon-glow's fade needs `main` to stay above
          a floor height or overflow-hidden clips it into a hard-edged
          rectangle instead of fading out, see globals.css. */}
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <CourseHeader course={course} locale={locale} labels={labels}>
          <p className="mt-6 text-lg font-semibold text-white">
            {course.priceDisplay}
          </p>
        </CourseHeader>
      </div>
    </main>
  );
}
