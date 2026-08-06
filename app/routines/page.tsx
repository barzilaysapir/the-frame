import type { Metadata } from "next";
import Link from "next/link";
import { RoutineCard } from "@/components/RoutineCard";
import { getAllRoutines } from "@/lib/routines";
import { getAllInstructors, getInstructorBySlug } from "@/lib/instructors";

export const metadata: Metadata = {
  title: "רוטינות",
  description:
    "עיינו בכל רוטינות הריקוד — קומרשל, היפ הופ והילס — עם פירוק מלא, מצב תרגול במראה וספירות בהאטה.",
};

interface RoutinesPageProps {
  searchParams: Promise<{ instructor?: string }>;
}

export default async function RoutinesPage({ searchParams }: RoutinesPageProps) {
  const { instructor: instructorSlug } = await searchParams;
  const allRoutines = getAllRoutines();
  const routines = instructorSlug
    ? allRoutines.filter((routine) => routine.instructorSlug === instructorSlug)
    : allRoutines;
  const activeInstructor = instructorSlug
    ? getInstructorBySlug(instructorSlug)
    : undefined;
  const instructors = getAllInstructors();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {activeInstructor ? `רוטינות עם ${activeInstructor.name}` : "כל הרוטינות"}
        </h1>
        <p className="mt-4 text-frame-silver">
          כל רוטינה כוללת פירוק מלא לספירות, מצב תרגול במראה ובהאטה, וגישה לכל
          החיים.
        </p>
      </div>

      {/* Instructor filter chips */}
      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/routines"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !activeInstructor
              ? "border-frame-cyan bg-frame-cyan/10 text-frame-cyan"
              : "border-frame-border text-frame-silver hover:border-white/40 hover:text-white"
          }`}
        >
          כולם
        </Link>
        {instructors.map((instructor) => (
          <Link
            key={instructor.slug}
            href={`/routines?instructor=${instructor.slug}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeInstructor?.slug === instructor.slug
                ? "border-frame-cyan bg-frame-cyan/10 text-frame-cyan"
                : "border-frame-border text-frame-silver hover:border-white/40 hover:text-white"
            }`}
          >
            {instructor.name}
          </Link>
        ))}
      </div>

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
        <p className="text-frame-silver">אין רוטינות להצגה כרגע.</p>
      )}
    </main>
  );
}
