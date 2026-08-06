import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import type { InstructorRecord } from "@/lib/instructors";

interface InstructorCardProps {
  instructor: InstructorRecord;
  routineCount?: number;
}

export function InstructorCard({ instructor, routineCount }: InstructorCardProps) {
  return (
    <a
      href={instructor.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-frame-border bg-frame-panel p-6 transition-colors hover:border-frame-cyan/60"
      aria-label={`${instructor.name} באינסטגרם`}
    >
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

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-frame-border pt-4">
        {typeof routineCount === "number" && routineCount > 0 ? (
          <p className="text-sm text-frame-silver">
            {routineCount === 1
              ? "קומבינציה אחת"
              : `${routineCount} קומבינציות`}{" "}
            באתר
          </p>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
          <Instagram className="h-4 w-4" aria-hidden="true" />
          אינסטגרם
        </span>
      </div>
    </a>
  );
}

export default InstructorCard;
