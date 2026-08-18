import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CourseComingSoon } from "@/components/courses/CourseComingSoon";
import { CourseMobileStickyCta } from "@/components/courses/CourseMobileStickyCta";
import { CoursePurchaseCard } from "@/components/courses/CoursePurchaseCard";
import { CourseTags } from "@/components/courses/CourseTags";
import { CourseWatch } from "@/components/courses/CourseWatch";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { parsePriceIls } from "@/lib/pricing";
import { getCachedExternalCourse } from "@/lib/server/catalog";

export const revalidate = 300;

interface ExternalCourseDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ExternalCourseDetailPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};

  const course = await getCachedExternalCourse(localeParam, slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description || course.tagline,
  };
}

export default async function ExternalCourseDetailPage({
  params,
}: ExternalCourseDetailPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);

  const course = await getCachedExternalCourse(locale, slug);
  if (!course) notFound();

  const hasLessons = course.lessons.length > 0;

  if (!hasLessons) {
    return (
      <CourseComingSoon
        course={course}
        locale={locale}
        labels={{
          comingSoonBadge: dict.externalCourses.comingSoonBadge,
          comingSoonNote: dict.externalCourses.comingSoonNote,
          taughtBy: dict.tutorials.taughtBy,
          back: dict.common.backToLibrary,
          externalCourseTag: dict.externalCourses.tag,
        }}
      />
    );
  }

  const priceIls = parsePriceIls(course.priceDisplay);
  const checkoutHref = localePath(locale, `/checkout/${course.slug}`);
  const purchaseLabels = {
    pricingNote: dict.externalCourses.pricingNote,
    getAccessNow: dict.routine.getAccessNow,
    secureNote: dict.routine.secureNote,
    guarantees: dict.externalCourses.guarantees,
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <Link
          href={localePath(locale, "/routines")}
          className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
          {dict.common.backToLibrary}
        </Link>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="mb-8 max-w-3xl">
              <CourseTags
                course={course}
                locale={locale}
                externalCourseLabel={dict.externalCourses.tag}
                className="mb-4"
              />
              <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-3 text-sm text-frame-silver">
                {formatMessage(dict.tutorials.taughtBy, {
                  name: course.provider,
                })}
              </p>
              {course.tagline ? (
                <p className="mt-4 text-lg text-frame-silver">{course.tagline}</p>
              ) : null}
              {course.description ? (
                <p className="mt-3 text-frame-silver">{course.description}</p>
              ) : null}
            </section>

            <Suspense
              fallback={
                <div className="aspect-video w-full rounded-2xl border border-frame-border bg-black/40" />
              }
            >
              <CourseWatch
                courseSlug={course.slug}
                lessons={course.lessons}
                checkoutHref={checkoutHref}
                playerLabels={dict.player}
                loginErrors={dict.login.errors}
                lessonsHeading={dict.externalCourses.lessonsHeading}
                playerChrome={{
                  signInPrompt: dict.externalCourses.signInPrompt,
                  signInCta: dict.externalCourses.signInCta,
                  loading: dict.externalCourses.loadingVideo,
                  unavailable: dict.externalCourses.videoUnavailable,
                  purchaseRequired: dict.externalCourses.purchaseRequired,
                  purchaseRequiredCta: dict.externalCourses.purchaseRequiredCta,
                }}
              />
            </Suspense>
          </div>

          {priceIls != null ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <CoursePurchaseCard
                  priceIls={priceIls}
                  checkoutHref={checkoutHref}
                  loginErrors={dict.login.errors}
                  labels={purchaseLabels}
                />
              </div>
            </aside>
          ) : null}
        </div>
      </main>

      {priceIls != null ? (
        <CourseMobileStickyCta
          priceIls={priceIls}
          checkoutHref={checkoutHref}
          ctaLabel={dict.routine.getAccessNow}
          loginErrors={dict.login.errors}
        />
      ) : null}
    </>
  );
}
