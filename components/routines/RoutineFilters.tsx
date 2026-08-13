import Link from "next/link";
import { RoutineFilterGroup, type RoutineFilterChip } from "@/components/routines/RoutineFilterGroup";
import {
  RoutineFilterMultiSelect,
  type RoutineFilterMultiSelectOption,
} from "@/components/routines/RoutineFilterMultiSelect";
import { Panel } from "@/components/ui/Panel";

export type RoutineFilterSection =
  | { type: "chips"; label: string; chips: RoutineFilterChip[] }
  | {
      type: "multiselect";
      label: string;
      options: RoutineFilterMultiSelectOption[];
      allHref: string;
      allLabel: string;
      triggerLabel: string;
      showSearch?: boolean;
      searchPlaceholder?: string;
      searchAriaLabel?: string;
      noMatchesLabel?: string;
    };

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
    <Panel as="section" aria-label={ariaLabel} className="mb-10 bg-frame-panel/40">
      {/* NOTE: the panel intentionally has no `overflow-hidden` — the filter
          dropdowns below render absolutely-positioned popovers that must be
          able to escape this container's bounds. */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3.5 sm:px-5 sm:py-4">
        {sections.map((section) =>
          section.type === "multiselect" ? (
            <RoutineFilterMultiSelect
              key={section.label}
              label={section.label}
              options={section.options}
              allHref={section.allHref}
              allLabel={section.allLabel}
              triggerLabel={section.triggerLabel}
              showSearch={section.showSearch}
              searchPlaceholder={section.searchPlaceholder}
              searchAriaLabel={section.searchAriaLabel}
              noMatchesLabel={section.noMatchesLabel}
            />
          ) : (
            <RoutineFilterGroup key={section.label} label={section.label} chips={section.chips} />
          ),
        )}
      </div>

      {hasActiveFilters ? (
        <div className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-frame-border bg-frame-bg/40 px-4 py-3 sm:px-5">
          <p className="text-sm text-frame-silver">{resultLabel}</p>
          <Link
            href={clearHref}
            className="text-sm font-semibold text-frame-cyan transition-colors hover:text-white"
          >
            {clearLabel}
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}
