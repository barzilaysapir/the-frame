"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { routinesFilterHref } from "@/lib/routines";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

function toggleSelection(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

interface UseRoutineFiltersArgs {
  locale: Locale;
  allRoutines: CatalogRoutine[];
  initialInstructors: string[];
  initialStyles: string[];
  initialLevels: string[];
}

/** Owns the three filter selections, the filtered routine list, and keeps the URL in sync. */
export function useRoutineFilters({
  locale,
  allRoutines,
  initialInstructors,
  initialStyles,
  initialLevels,
}: UseRoutineFiltersArgs) {
  const [selectedInstructors, setSelectedInstructors] = useState(initialInstructors);
  const [selectedStyles, setSelectedStyles] = useState(initialStyles);
  const [selectedLevels, setSelectedLevels] = useState(initialLevels);

  const filteredRoutines = useMemo(() => {
    let routines = allRoutines;
    if (selectedInstructors.length > 0) {
      routines = routines.filter((routine) =>
        selectedInstructors.includes(routine.instructorSlug),
      );
    }
    if (selectedStyles.length > 0) {
      routines = routines.filter((routine) => selectedStyles.includes(routine.style));
    }
    if (selectedLevels.length > 0) {
      routines = routines.filter((routine) => selectedLevels.includes(routine.level));
    }
    return routines;
  }, [allRoutines, selectedInstructors, selectedStyles, selectedLevels]);

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
    filteredRoutines,
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
