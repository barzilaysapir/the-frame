import type { Metadata } from "next";
import { InstructorCard } from "@/components/InstructorCard";
import { getAllInstructors } from "@/lib/instructors";
import { getRoutinesByInstructor } from "@/lib/routines";

export const metadata: Metadata = {
  title: "מורים",
  description:
    "הכירו את המורים של The Frame by Barzilay — רקדנים מקצועיים עם ניסיון בהפקות, קליפים ותחרויות בינלאומיות.",
};

export default function InstructorsPage() {
  const instructors = getAllInstructors();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          המורים שלנו
        </h1>
        <p className="mt-4 text-frame-silver">
          כל מורה ב-The Frame מביא רקע מקצועי משלו — ג&apos;אז פאנק, היפ הופ ועקבים —
          ובונה כל קומבינציה כך שתלמדו אותה לעומק, פריים אחרי פריים.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <InstructorCard
            key={instructor.slug}
            instructor={instructor}
            routineCount={getRoutinesByInstructor(instructor.slug).length}
          />
        ))}
      </div>
    </main>
  );
}
