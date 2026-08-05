import { Clock, Disc3, Music2, Target, type LucideIcon } from "lucide-react";

export interface RoutineDetail {
  icon: "length" | "bpm" | "song" | "technique";
  label: string;
  value: string;
}

const ICONS: Record<RoutineDetail["icon"], LucideIcon> = {
  length: Clock,
  bpm: Disc3,
  song: Music2,
  technique: Target,
};

interface RoutineBreakdownProps {
  details: RoutineDetail[];
}

export function RoutineBreakdown({ details }: RoutineBreakdownProps) {
  return (
    <section aria-labelledby="routine-breakdown-heading">
      <h2
        id="routine-breakdown-heading"
        className="mb-4 text-lg font-semibold text-white"
      >
        מה כלול
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {details.map((detail) => {
          const Icon = ICONS[detail.icon];
          return (
            <div
              key={detail.label}
              className="flex items-start gap-3 rounded-xl border border-frame-border bg-frame-panel p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-frame-gold/10 text-frame-gold">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-xs text-frame-muted">{detail.label}</p>
                <p className="text-sm font-medium text-white">{detail.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RoutineBreakdown;
