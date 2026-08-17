import { formatMessage } from "@/lib/i18n/get-dictionary";

interface InstructorContentCountsProps {
  routineCount: number;
  courseCount: number;
  labels: {
    routineOne: string;
    routineMany: string;
    courseOne: string;
    courseMany: string;
  };
}

export function InstructorContentCounts({
  routineCount,
  courseCount,
  labels,
}: InstructorContentCountsProps) {
  if (routineCount === 0 && courseCount === 0) return null;

  return (
    <div className="mt-5 space-y-1 border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
      {routineCount > 0 ? (
        <p>
          {routineCount === 1
            ? labels.routineOne
            : formatMessage(labels.routineMany, { count: routineCount })}
        </p>
      ) : null}
      {courseCount > 0 ? (
        <p>
          {courseCount === 1
            ? labels.courseOne
            : formatMessage(labels.courseMany, { count: courseCount })}
        </p>
      ) : null}
    </div>
  );
}
