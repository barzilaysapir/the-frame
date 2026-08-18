import { Film } from "lucide-react";
import { CourseCheckout } from "@/components/courses/CourseCheckout";
import { CourseTags } from "@/components/courses/CourseTags";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseLandingPreviewProps {
  course: CatalogExternalCourse;
  locale: Locale;
  priceIls: number;
  dict: Dictionary;
}

/**
 * Marketing/preview layout for an external course before purchase —
 * matches CourseComingSoon's centered style rather than the post-purchase
 * 2-column watch layout, with a promo video slot and the plan
 * picker/payment flow (formerly a separate /checkout/[slug] page) merged
 * directly in, per feedback.
 *
 * Takes the whole `dict` rather than individual label props since this
 * page's own header uses `dict.tutorials.taughtBy` ("בהנחיית {name}",
 * interpolated via formatMessage) — the embedded CourseCheckout has no
 * title/instructor header of its own, to avoid duplicating this one.
 */
export function CourseLandingPreview({
  course,
  locale,
  priceIls,
  dict,
}: CourseLandingPreviewProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="neon-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="text-center">
          <CourseTags
            course={course}
            locale={locale}
            externalCourseLabel={dict.externalCourses.tag}
            className="justify-center"
          />
          <span className="mx-auto mt-4 inline-flex w-fit items-center rounded-full border border-frame-border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-frame-silver">
            {dict.externalCourses.availableBadge}
          </span>
          <h1 className="mt-5 text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
            {course.title}
          </h1>
          <p className="mt-3 text-sm text-frame-silver">
            {formatMessage(dict.tutorials.taughtBy, { name: course.provider })}
          </p>
          {course.tagline ? (
            <p className="mt-5 text-lg text-frame-silver">{course.tagline}</p>
          ) : null}
          {course.description ? (
            <p className="mt-4 text-frame-silver">{course.description}</p>
          ) : null}
        </div>

        {/* Promo video — placeholder until a real teaser clip exists (separate from summary.mp4, which stays a gated lesson). */}
        <div className="mt-10 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-frame-border bg-black/40 text-frame-muted">
          <Film className="h-10 w-10" aria-hidden="true" />
          <p className="text-sm">{dict.externalCourses.promoPlaceholder}</p>
        </div>

        <div className="mt-12 border-t border-frame-border pt-10">
          <CourseCheckout
            locale={locale}
            courseSlug={course.slug}
            priceIls={priceIls}
            labels={dict.checkout}
            loginErrors={dict.login.errors}
            continueGoogleLabel={dict.login.continueGoogle}
          />
        </div>
      </div>
    </main>
  );
}
