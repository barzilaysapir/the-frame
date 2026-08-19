import { CourseCheckout } from "@/components/courses/CourseCheckout";
import { CourseHeader } from "@/components/courses/CourseHeader";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseLandingPreviewProps {
  course: CatalogExternalCourse;
  locale: Locale;
  priceIls: number;
  dict: Dictionary;
}

/**
 * Marketing/preview layout for an external course before purchase —
 * shares CourseHeader (incl. the promo video slot) with CourseComingSoon,
 * adding the plan picker/payment flow (formerly a separate
 * /checkout/[slug] page) merged directly in, per feedback.
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
        <CourseHeader
          course={course}
          locale={locale}
          labels={{
            back: dict.common.backToLibrary,
            externalCourseTag: dict.externalCourses.tag,
            taughtBy: dict.routine.taughtBy,
            promoPlaceholder: dict.externalCourses.promoPlaceholder,
          }}
        />

        <div className="mt-12 border-t border-frame-border pt-10">
          <CourseCheckout
            locale={locale}
            courseSlug={course.slug}
            priceIls={priceIls}
            labels={dict.checkout}
            loginErrors={dict.login.errors}
            continueGoogleLabel={dict.login.continueGoogle}
            termsDict={dict.terms}
            closeLabel={dict.common.close}
          />
        </div>
      </div>
    </main>
  );
}
