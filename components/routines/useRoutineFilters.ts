"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { routinesFilterHref } from "@/lib/routines";
import type { LibraryItem } from "@/components/routines/libraryItem";

function toggleSelection(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

interface UseRoutineFiltersArgs {
  locale: Locale;
  allItems: LibraryItem[];
  initialInstructors: string[];
  initialStyles: string[];
  initialLevels: string[];
}

/** Owns the filter selections, the filtered library item list, and keeps the URL in sync. */
export function useRoutineFilters({
  locale,
  allItems,
  initialInstructors,
  initialStyles,
  initialLevels,
}: UseRoutineFiltersArgs) {
  const [selectedInstructors, setSelectedInstructors] = useState(initialInstructors);
  const [selectedStyles, setSelectedStyles] = useState(initialStyles);
  const [selectedLevels, setSelectedLevels] = useState(initialLevels);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (selectedInstructors.length > 0) {
      items = items.filter((item) =>
        item.kind === "lesson"
          ? selectedInstructors.includes(item.routine.instructorSlug)
          : item.course.instructorSlug != null &&
            selectedInstructors.includes(item.course.instructorSlug),
      );
    }
    if (selectedStyles.length > 0) {
      items = items.filter((item) =>
        item.kind === "lesson"
          ? selectedStyles.includes(item.routine.style)
          : item.course.style != null && selectedStyles.includes(item.course.style),
      );
    }
    if (selectedLevels.length > 0) {
      items = items.filter((item) =>
        item.kind === "lesson"
          ? selectedLevels.includes(item.routine.level)
          : item.course.level != null && selectedLevels.includes(item.course.level),
      );
    }
    return items;
  }, [allItems, selectedInstructors, selectedStyles, selectedLevels]);

  // Raw History API, not next/navigation's router — a router-driven update
  // would re-invoke the Server Component, the exact round-trip this avoids.
  useEffect(() => {
    const href = routinesFilterHref({
      instructor: selectedInstructors,
      style: selectedStyles,
      level: selectedLevels,
      locale,
    });
    window.history.replaceState(null, "", href);
  }, [selectedInstructors, selectedStyles, selectedLevels, locale]);

  const hasActiveFilters =
    selectedInstructors.length > 0 || selectedStyles.length > 0 || selectedLevels.length > 0;

  return {
    selectedInstructors,
    selectedStyles,
    selectedLevels,
    filteredItems,
    hasActiveFilters,
    toggleInstructor: (value: string) =>
      setSelectedInstructors((prev) => toggleSelection(prev, value)),
    toggleStyle: (value: string) => setSelectedStyles((prev) => toggleSelection(prev, value)),
    toggleLevel: (value: string) => setSelectedLevels((prev) => toggleSelection(prev, value)),
    clearInstructors: () => setSelectedInstructors([]),
    clearStyles: () => setSelectedStyles([]),
    clearLevels: () => setSelectedLevels([]),
    clearAll: () => {
      setSelectedInstructors([]);
      setSelectedStyles([]);
      setSelectedLevels([]);
    },
  };
}
