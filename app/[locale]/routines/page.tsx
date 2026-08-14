import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalCourseCard } from "@/components/ExternalCourseCard";
import { RoutineLibrary } from "@/components/routines/RoutineLibrary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { resolveCatalog } from "@/lib/server/catalog";

// NOTE: this route reads `searchParams` only to seed the *initial* filter
// selection (so a shared/bookmarked filtered link still SSRs correctly and
// works without JS) — `revalidate` has no effect here today since that opts
// the whole page into dynamic rendering in Next's non-Cache-Components
// model. Every filter interaction after first load happens client-side in
// RoutineLibrary and never re-hits this route; see the comment there for why.
export const revalidate = 300;

// Initial/per-scroll page size for the library's infinite scroll. The full
// catalog is fetched once here (cheap at today's ~100-routine size) and
// handed to the client, which filters and slices it locally — no further
// server round-trips for filtering or pagination.
const PAGE_SIZE = 12;

interface RoutinesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    instructor?: string;
    style?: string;
    level?: string;
  }>;
}

export async function generateMetadata({
  params,
}: Pick<RoutinesPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.tutorials.title,
    description: dict.tutorials.subtitle,
  };
}

export default async function RoutinesPage({ params, searchParams }: RoutinesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();

  const { instructor: instructorSlug, style, level } = await searchParams;

  const [allRoutines, instructors, externalCourses] = await Promise.all([
    repository.listRoutines(locale),
    repository.listInstructors(locale),
    repository.listExternalCourses(locale),
  ]);

  const styles = [...new Set(allRoutines.map((routine) => routine.style))];
  const levels = [...new Set(allRoutines.map((routine) => routine.level))];

  const initialInstructors = instructorSlug ? instructorSlug.split(",").filter(Boolean) : [];
  const initialStyles = style ? style.split(",").filter(Boolean) : [];
  const initialLevels = level ? level.split(",").filter(Boolean) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.tutorials.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.tutorials.subtitle}</p>
      </div>

      <RoutineLibrary
        locale={locale}
        allRoutines={allRoutines}
        instructors={instructors}
        styles={styles}
        levels={levels}
        initialInstructors={initialInstructors}
        initialStyles={initialStyles}
        initialLevels={initialLevels}
        pageSize={PAGE_SIZE}
      />

      {externalCourses.length > 0 ? (
        <section className="mt-16 border-t border-frame-border pt-12">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
              {dict.externalCourses.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {externalCourses.map((course) => (
              <ExternalCourseCard
                key={course.slug}
                course={course}
                locale={locale}
                labels={{
                  comingSoonBadge: dict.externalCourses.comingSoonBadge,
                  providerPrefix: dict.externalCourses.providerPrefix,
                  cta: dict.externalCourses.cta,
                  linkAria: dict.externalCourses.linkAria,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
