import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "מדריכים וקורסים",
  description:
    "עיינו במדריכים וקורסים — ג'אז פאנק, היפ הופ ועקבים — עם פירוק מלא, מצב תרגול במראה וספירות בהאטה.",
};

interface RoutinesPageProps {
  searchParams: Promise<{
    instructor?: string;
    style?: string;
    level?: string;
  }>;
}

export default async function RoutinesPage({ searchParams }: RoutinesPageProps) {
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          מדריכים וקורסים
        </h1>
        <p className="mt-4 text-frame-silver">
          כל מדריך וקורס כוללים פירוק מלא לספירות, מצב תרגול במראה ובהאטה, וגישה לכל
          החיים.
        </p>
      </div>

      <RoutineFilters
        resultCount={routines.length}
        hasActiveFilters={hasActiveFilters}
        clearHref="/routines"
        sections={[
          {
            label: "מורה",
            chips: [
              {
                label: "הכל",
                href: routinesFilterHref({
                  style: filters.style,
                  level: filters.level,
                }),
                active: !filters.instructor,
              },
              ...instructors.map((instructor) => ({
                label: instructor.name,
                href: routinesFilterHref({
                  instructor: instructor.slug,
                  style: filters.style,
                  level: filters.level,
                }),
                active: filters.instructor === instructor.slug,
              })),
            ],
          },
          {
            label: "סגנון",
            chips: [
              {
                label: "הכל",
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  level: filters.level,
                }),
                active: !filters.style,
              },
              ...styles.map((item) => ({
                label: item,
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: item,
                  level: filters.level,
                }),
                active: filters.style === item,
              })),
            ],
          },
          {
            label: "רמה",
            chips: [
              {
                label: "הכל",
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: filters.style,
                }),
                active: !filters.level,
              },
              ...levels.map((item) => ({
                label: item,
                href: routinesFilterHref({
                  instructor: filters.instructor,
                  style: filters.style,
                  level: item,
                }),
                active: filters.level === item,
              })),
            ],
          },
        ]}
      />

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.slug}
              routine={routine}
              instructorName={getInstructorBySlug(routine.instructorSlug)?.name}
            />
          ))}
        </div>
      ) : (
        <p className="text-frame-silver">אין מדריכים וקורסים להצגה כרגע.</p>
      )}
    </main>
  );
}
