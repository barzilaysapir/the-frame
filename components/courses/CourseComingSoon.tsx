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
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <CourseHeader course={course} locale={locale} labels={labels} />
      </div>
    </main>
  );
}
