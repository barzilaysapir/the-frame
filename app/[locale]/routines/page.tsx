import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalCourseCard } from "@/components/ExternalCourseCard";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineFilters } from "@/components/routines/RoutineFilters";
import type { DanceStyleKey, LevelKey } from "@/lib/routines";
import { routinesFilterHref } from "@/lib/routines";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { resolveCatalog } from "@/lib/server/catalog";

// NOTE: this route reads `searchParams` (filter chips below), which opts the
// whole page into dynamic rendering in Next's non-Cache-Components model —
// `revalidate` has no effect here today. Left in place (harmless) since it's
// the correct fix if this page's filtering ever moves off server-side
// searchParams; the other catalog pages below don't have this constraint.
export const revalidate = 300;

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

export default async function RoutinesPage({
  params,
  searchParams,
}: RoutinesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();

  const {
    instructor: instructorSlug,
    style,
    level,
  } = await searchParams;

  const [allRoutines, instructors, externalCourses] = await Promise.all([
    repository.listRoutines(locale),
    repository.listInstructors(locale),
    repository.listExternalCourses(locale),
  ]);

  const styles = [...new Set(allRoutines.map((routine) => routine.style))];
  const levels = [...new Set(allRoutines.map((routine) => routine.level))];

  const filters = {
    instructor: instructorSlug,
    style: style as DanceStyleKey | undefined,
    level: level as LevelKey | undefined,
    locale,
  };

  let routines = allRoutines;
  if (filters.instructor) {
    routines = routines.filter(
      (routine) => routine.instructorSlug === filters.instructor,
    );
  }
  if (filters.style) {
    routines = routines.filter((routine) => routine.style === filters.style);
  }
  if (filters.level) {
    routines = routines.filter((routine) => routine.level === filters.level);
  }

  const instructorBySlug = new Map(
    instructors.map((instructor) => [instructor.slug, instructor]),
  );

  const hasActiveFilters = Boolean(
    filters.instructor || filters.style || filters.level,
  );

  const resultLabel =
    routines.length === 0
      ? dict.tutorials.resultNone
      : routines.length === 1
        ? dict.tutorials.resultOne
        : formatMessage(dict.tutorials.resultMany, { count: routines.length });

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.tutorials.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.tutorials.subtitle}</p>
      </div>

      <RoutineFilters
        ariaLabel={dict.tutorials.filterAria}
        resultLabel={resultLabel}
        clearLabel={dict.tutorials.clearFilters}
        hasActiveFilters={hasActiveFilters}
        clearHref={localePath(locale, "/routines")}
        sections={[
          {
            label: dict.tutorials.filterTeacher,
            chips: [
              {
                label: dict.tutorials.filterAll,
                href: routinesFilterHref({
                  style: filters.style,
                  level: filters.level,
                  locale,
                }),
                active: !filters.instructor,
              },
              ...instructors.map((instructor) => ({
                label: instructor.name,
                href: routinesFilterHref({
                  instructor: instructor.slug,
                  style: filters.style,
                  level: filters.level,
                  locale,
                }),
                active: filters.instructor === instructor.slug,
              })),
            ],
          },
          {
            label: dict.tutorials.filterStyle,
            chips: [
              {
                label: dict.tutorials.filterAll,
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  level: filters.level,
                  locale,
                }),
                active: !filters.style,
              },
              ...styles.map((item) => {
                const label =
                  allRoutines.find((routine) => routine.style === item)
                    ?.styleLabel ?? item;
                return {
                  label,
                  href: routinesFilterHref({
                    instructor: filters.instructor,
                    style: item,
                    level: filters.level,
                    locale,
                  }),
                  active: filters.style === item,
                };
              }),
            ],
          },
          {
            label: dict.tutorials.filterLevel,
            chips: [
              {
                label: dict.tutorials.filterAll,
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: filters.style,
                  locale,
                }),
                active: !filters.level,
              },
              ...levels.map((item) => {
                const label =
                  allRoutines.find((routine) => routine.level === item)
                    ?.levelLabel ?? item;
                return {
                  label,
                  href: routinesFilterHref({
                    instructor: filters.instructor,
                    style: filters.style,
                    level: item,
                    locale,
                  }),
                  active: filters.level === item,
                };
              }),
            ],
          },
        ]}
      />

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine, index) => (
            <RoutineCard
              key={routine.slug}
              routine={routine}
              locale={locale}
              instructorName={
                instructorBySlug.get(routine.instructorSlug)?.name
              }
              priority={index < 3}
              labels={{
                viewRoutine: dict.tutorials.viewRoutine,
                taughtBy: dict.tutorials.taughtBy,
                favoriteAdd: dict.tutorials.favoriteAdd,
                favoriteRemove: dict.tutorials.favoriteRemove,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-frame-silver">{dict.tutorials.empty}</p>
      )}

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
