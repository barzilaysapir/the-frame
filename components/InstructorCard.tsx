import Link from "next/link";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import type { InstructorRecord } from "@/lib/instructors";

interface InstructorCardProps {
  instructor: InstructorRecord;
  routineCount?: number;
}

export function InstructorCard({ instructor, routineCount }: InstructorCardProps) {
  return (
    <div className="rounded-2xl border border-frame-border bg-frame-panel p-6">
      <div className="flex items-center gap-3">
        <InstructorAvatar name={instructor.name} className="h-12 w-12 text-sm" />
        <div>
          <h3 className="font-display text-xl font-black text-white">
            {instructor.name}
          </h3>
          <p className="text-sm text-frame-silver">{instructor.role}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-frame-silver">
        {instructor.bio}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {instructor.specialties.map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-frame-border px-2.5 py-1 text-[11px] font-medium text-frame-muted"
          >
            {specialty}
          </span>
        ))}
      </div>

      {typeof routineCount === "number" && routineCount > 0 && (
        <Link
          href={`/routines?instructor=${instructor.slug}`}
          className="mt-5 inline-flex items-center text-sm font-semibold text-frame-cyan transition-colors hover:text-white"
        >
          {routineCount === 1 ? "קומבינציה אחת" : `${routineCount} קומבינציות`} עם{" "}
          {instructor.name}
        </Link>
      )}
    </div>
  );
}

export default InstructorCard;
