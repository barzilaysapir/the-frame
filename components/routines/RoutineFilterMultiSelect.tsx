"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { RoutineFilterChipRow } from "@/components/routines/RoutineFilterChipRow";
import { RoutineFilterDropdown } from "@/components/routines/RoutineFilterDropdown";
import { useFittedChips } from "@/components/routines/useFittedChips";
import type { RoutineFilterMultiSelectOption } from "@/components/routines/routineFilterTypes";

export type { RoutineFilterMultiSelectOption };

interface RoutineFilterMultiSelectProps {
  label: string;
  options: RoutineFilterMultiSelectOption[];
  /** Toggles a single option on/off within the current selection. */
  onToggle: (value: string) => void;
  /** Clears this filter dimension entirely. */
  onClear: () => void;
  clearLabel: string;
  placeholder: string;
  optionRemoveAriaLabel: (optionLabel: string) => string;
  /** Shows a search box above the option list. Defaults to true; set false for short option lists (style/level). */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  noMatchesLabel?: string;
}

export function RoutineFilterMultiSelect({
  label,
  options,
  onToggle,
  onClear,
  clearLabel,
  placeholder,
  optionRemoveAriaLabel,
  showSearch = true,
  searchPlaceholder,
  searchAriaLabel,
  noMatchesLabel,
}: RoutineFilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Snapshot of value -> position, selected options first, taken once when
  // the dropdown opens. Toggling options afterward doesn't recompute this,
  // so nothing moves out from under the cursor mid-session (that reordering
  // was what caused the whole page to jump scroll position earlier). Only
  // matters while the search is empty — cmdk takes over ranking once you type.
  const [openOrder, setOpenOrder] = useState<Map<string, number>>(new Map());

  const selectedOptions = options.filter((option) => option.active);
  const hasActive = selectedOptions.length > 0;

  const { rowRef, measureRowRef, visibleChipCount } = useFittedChips(selectedOptions);
  const visibleChips = selectedOptions.slice(0, visibleChipCount);
  const hiddenChipCount = selectedOptions.length - visibleChips.length;

  const orderedOptions = [...options].sort(
    (a, b) => (openOrder.get(a.value) ?? Infinity) - (openOrder.get(b.value) ?? Infinity),
  );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setQuery("");
      setOpenOrder(
        new Map(
          [...options]
            .sort((a, b) => Number(b.active) - Number(a.active))
            .map((option, index) => [option.value, index]),
        ),
      );
    }
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <RoutineFilterChipRow
        label={label}
        placeholder={placeholder}
        isOpen={isOpen}
        onToggleOpen={() => handleOpenChange(!isOpen)}
        hasActive={hasActive}
        selectedOptions={selectedOptions}
        visibleChips={visibleChips}
        hiddenChipCount={hiddenChipCount}
        onToggle={onToggle}
        optionRemoveAriaLabel={optionRemoveAriaLabel}
        rowRef={rowRef}
        measureRowRef={measureRowRef}
      />
      <RoutineFilterDropdown
        label={label}
        orderedOptions={orderedOptions}
        onToggle={onToggle}
        hasActive={hasActive}
        onClear={onClear}
        clearLabel={clearLabel}
        query={query}
        onQueryChange={setQuery}
        onBackspaceEmpty={() => {
          // Standard tag-input convention: an empty search backspaces the
          // last-selected chip instead of doing nothing.
          if (selectedOptions.length > 0) {
            onToggle(selectedOptions[selectedOptions.length - 1].value);
          }
        }}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        noMatchesLabel={noMatchesLabel}
      />
    </Popover.Root>
  );
}
