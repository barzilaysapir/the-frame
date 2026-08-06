import Link from "next/link";
import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import type { InstructorRecord } from "@/lib/instructors";

interface InstructorCardProps {
  instructor: InstructorRecord;
  routineCount?: number;
}

export function InstructorCard({ instructor, routineCount }: InstructorCardProps) {
  return (
    <article className="group relative rounded-2xl border border-frame-border bg-frame-panel p-6 transition-colors hover:border-frame-cyan/60">
      <a
        href={instructor.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`${instructor.name} באינסטגרם`}
      />

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <InstructorAvatar name={instructor.name} className="h-12 w-12 text-sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-white">
                {instructor.name}
              </h3>
              <Instagram
                className="h-4 w-4 shrink-0 text-frame-cyan transition-colors group-hover:text-white"
                aria-hidden="true"
              />
            </div>
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
      </div>

      {typeof routineCount === "number" && routineCount > 0 ? (
        <Link
          href={`/routines?instructor=${instructor.slug}`}
          className="relative z-10 mt-5 inline-flex border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors hover:text-white"
        >
          {routineCount === 1
            ? "קומבינציה אחת באתר"
            : `${routineCount} קומבינציות באתר`}
        </Link>
      ) : null}
    </article>
  );
}

export default InstructorCard;
