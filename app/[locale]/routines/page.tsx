import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoutineCard } from "@/components/RoutineCard";
import { RoutineFilters } from "@/components/routines/RoutineFilters";
import {
  getAllRoutineLevels,
  getAllRoutineStyles,
  getAllRoutines,
  getRoutinesByInstructor,
  getRoutinesByLevel,
  getRoutinesByStyle,
  routinesFilterHref,
} from "@/lib/routines";
import { getAllInstructors, getInstructorBySlug } from "@/lib/instructors";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import {
  localizeInstructor,
  localizeLevel,
  localizeStyle,
} from "@/lib/i18n/localize";
import { localePath } from "@/lib/i18n/path";

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

  const {
    instructor: instructorSlug,
    style,
    level,
  } = await searchParams;
  const allRoutines = getAllRoutines();
  const instructors = getAllInstructors();
  const styles = getAllRoutineStyles();
  const levels = getAllRoutineLevels();

  const activeInstructor = instructorSlug
    ? getInstructorBySlug(instructorSlug)
    : undefined;

  const filters = {
    instructor: activeInstructor?.slug,
    style,
    level,
    locale,
  };

  let routines = allRoutines;
  if (filters.instructor) {
    routines = getRoutinesByInstructor(filters.instructor);
  }
  if (filters.style) {
    const byStyle = new Set(getRoutinesByStyle(filters.style).map((r) => r.slug));
    routines = routines.filter((routine) => byStyle.has(routine.slug));
  }
  if (filters.level) {
    const byLevel = new Set(getRoutinesByLevel(filters.level).map((r) => r.slug));
    routines = routines.filter((routine) => byLevel.has(routine.slug));
  }

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
                label: localizeInstructor(locale, instructor).name,
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
              ...styles.map((item) => ({
                label: localizeStyle(locale, item),
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: item,
                  level: filters.level,
                  locale,
                }),
                active: filters.style === item,
              })),
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
              ...levels.map((item) => ({
                label: localizeLevel(locale, item),
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: filters.style,
                  level: item,
                  locale,
                }),
                active: filters.level === item,
              })),
            ],
          },
        ]}
      />

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => {
            const instructor = getInstructorBySlug(routine.instructorSlug);
            return (
              <RoutineCard
                key={routine.slug}
                routine={routine}
                locale={locale}
                instructorName={
                  instructor
                    ? localizeInstructor(locale, instructor).name
                    : undefined
                }
                labels={{
                  viewRoutine: dict.tutorials.viewRoutine,
                  taughtBy: dict.tutorials.taughtBy,
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-frame-silver">{dict.tutorials.empty}</p>
      )}
    </main>
  );
}
