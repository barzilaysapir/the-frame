import Link from "next/link";
import { RoutineFilterGroup, type RoutineFilterChip } from "@/components/routines/RoutineFilterGroup";

export interface RoutineFilterSection {
  label: string;
  chips: RoutineFilterChip[];
}

interface RoutineFiltersProps {
  sections: RoutineFilterSection[];
  resultLabel: string;
  clearLabel: string;
  ariaLabel: string;
  hasActiveFilters: boolean;
  clearHref: string;
}

export function RoutineFilters({
  sections,
  resultLabel,
  clearLabel,
  ariaLabel,
  hasActiveFilters,
  clearHref,
}: RoutineFiltersProps) {
  return (
    <section
      aria-label={ariaLabel}
      className="mb-10 overflow-hidden rounded-2xl border border-frame-border bg-frame-panel/40"
    >
      <div className="divide-y divide-frame-border">
        {sections.map((section) => (
          <div key={section.label} className="px-4 py-3.5 sm:px-5 sm:py-4">
            <RoutineFilterGroup label={section.label} chips={section.chips} />
          </div>
        ))}
      </div>

      {hasActiveFilters ? (
        <div className="flex items-center justify-between gap-4 border-t border-frame-border bg-frame-bg/40 px-4 py-3 sm:px-5">
          <p className="text-sm text-frame-silver">{resultLabel}</p>
          <Link
            href={clearHref}
            className="text-sm font-semibold text-frame-cyan transition-colors hover:text-white"
          >
            {clearLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
