import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalCourseCard } from "@/components/ExternalCourseCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { resolveCatalog } from "@/lib/server/catalog";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 5 minutes instead of refetching D1 on every request.
export const revalidate = 300;

interface ExternalCoursesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ExternalCoursesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.externalCourses.title,
    description: dict.externalCourses.subtitle,
  };
}

export default async function ExternalCoursesPage({
  params,
}: ExternalCoursesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();
  const courses = await repository.listExternalCourses(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.externalCourses.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.externalCourses.subtitle}</p>
        <p className="mt-3 text-sm text-frame-muted">
          {dict.externalCourses.disclosure}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <ExternalCourseCard
            key={course.slug}
            course={course}
            labels={{
              sponsoredBadge: dict.externalCourses.sponsoredBadge,
              providerPrefix: dict.externalCourses.providerPrefix,
              cta: dict.externalCourses.cta,
              linkAria: dict.externalCourses.linkAria,
            }}
          />
        ))}
      </div>
    </main>
  );
}
