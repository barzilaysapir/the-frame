"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineFilters, type RoutineFilterSection } from "@/components/routines/RoutineFilters";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, getDictionarySync } from "@/lib/i18n/get-dictionary";
import { routinesFilterHref, type DanceStyleKey, type LevelKey } from "@/lib/routines";
import type { CatalogInstructor, CatalogRoutine } from "@/lib/server/catalog/types";

interface RoutineLibraryProps {
  locale: Locale;
  allRoutines: CatalogRoutine[];
  instructors: CatalogInstructor[];
  styles: DanceStyleKey[];
  levels: LevelKey[];
  initialInstructors: string[];
  initialStyles: string[];
  initialLevels: string[];
  pageSize: number;
}

function toggleSelection(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

function selectedTriggerLabel(
  options: { label: string; active: boolean }[],
  placeholder: string,
): string {
  const activeLabels = options.filter((option) => option.active).map((option) => option.label);
  return activeLabels.length === 0 ? placeholder : activeLabels.join(", ");
}

/**
 * Owns filtering + pagination for the /routines library entirely client-side.
 * The full catalog (~100 routines) is fetched once by the server page; every
 * filter toggle here is a local state update, not a Next.js navigation — the
 * old href-per-option design re-ran the whole server component (dictionary +
 * D1 queries) on every click, which is what made filtering feel slow. The URL
 * is still kept in sync (via the raw History API, bypassing Next's router)
 * so links stay shareable/bookmarkable without paying for a round-trip.
 */
export function RoutineLibrary({
  locale,
  allRoutines,
  instructors,
  styles,
  levels,
  initialInstructors,
  initialStyles,
  initialLevels,
  pageSize,
}: RoutineLibraryProps) {
  const dict = getDictionarySync(locale);

  const [selectedInstructors, setSelectedInstructors] = useState(initialInstructors);
  const [selectedStyles, setSelectedStyles] = useState(initialStyles);
  const [selectedLevels, setSelectedLevels] = useState(initialLevels);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const instructorNameBySlug = useMemo(
    () => Object.fromEntries(instructors.map((instructor) => [instructor.slug, instructor.name])),
    [instructors],
  );

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

  useEffect(() => {
    const href = routinesFilterHref({
      instructor: selectedInstructors,
      style: selectedStyles,
      level: selectedLevels,
      locale,
    });
    window.history.replaceState(null, "", href);
  }, [selectedInstructors, selectedStyles, selectedLevels, locale]);

  const visibleRoutines = filteredRoutines.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRoutines.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, filteredRoutines.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, pageSize, filteredRoutines.length]);

  function toggleInstructor(value: string) {
    setSelectedInstructors((prev) => toggleSelection(prev, value));
    setVisibleCount(pageSize);
  }
  function toggleStyle(value: string) {
    setSelectedStyles((prev) => toggleSelection(prev, value));
    setVisibleCount(pageSize);
  }
  function toggleLevel(value: string) {
    setSelectedLevels((prev) => toggleSelection(prev, value));
    setVisibleCount(pageSize);
  }
  function clearAll() {
    setSelectedInstructors([]);
    setSelectedStyles([]);
    setSelectedLevels([]);
    setVisibleCount(pageSize);
  }

  const teacherOptions = instructors.map((instructor) => ({
    label: instructor.name,
    value: instructor.slug,
    active: selectedInstructors.includes(instructor.slug),
  }));
  const styleOptions = styles.map((item) => ({
    label: allRoutines.find((routine) => routine.style === item)?.styleLabel ?? item,
    value: item,
    active: selectedStyles.includes(item),
  }));
  const levelOptions = levels.map((item) => ({
    label: allRoutines.find((routine) => routine.level === item)?.levelLabel ?? item,
    value: item,
    active: selectedLevels.includes(item),
  }));

  const sections: RoutineFilterSection[] = [
    {
      type: "multiselect",
      label: dict.tutorials.filterTeacher,
      options: teacherOptions,
      onToggle: toggleInstructor,
      onClear: () => {
        setSelectedInstructors([]);
        setVisibleCount(pageSize);
      },
      allLabel: dict.tutorials.filterAll,
      triggerLabel: selectedTriggerLabel(teacherOptions, dict.tutorials.filterTeacherPlaceholder),
      showSearch: true,
      searchPlaceholder: dict.tutorials.filterTeacherSearchPlaceholder,
      searchAriaLabel: dict.tutorials.filterTeacherSearch,
      noMatchesLabel: dict.tutorials.filterTeacherNoMatches,
    },
    {
      type: "multiselect",
      label: dict.tutorials.filterStyle,
      options: styleOptions,
      onToggle: toggleStyle,
      onClear: () => {
        setSelectedStyles([]);
        setVisibleCount(pageSize);
      },
      allLabel: dict.tutorials.filterAll,
      triggerLabel: selectedTriggerLabel(styleOptions, dict.tutorials.filterStylePlaceholder),
      showSearch: false,
    },
    {
      type: "multiselect",
      label: dict.tutorials.filterLevel,
      options: levelOptions,
      onToggle: toggleLevel,
      onClear: () => {
        setSelectedLevels([]);
        setVisibleCount(pageSize);
      },
      allLabel: dict.tutorials.filterAll,
      triggerLabel: selectedTriggerLabel(levelOptions, dict.tutorials.filterLevelPlaceholder),
      showSearch: false,
    },
  ];

  const hasActiveFilters =
    selectedInstructors.length > 0 || selectedStyles.length > 0 || selectedLevels.length > 0;

  const total = filteredRoutines.length;
  const resultLabel =
    total === 0
      ? dict.tutorials.resultNone
      : total === 1
        ? dict.tutorials.resultOne
        : formatMessage(dict.tutorials.resultMany, { count: total });

  return (
    <>
      <RoutineFilters
        ariaLabel={dict.tutorials.filterAria}
        resultLabel={resultLabel}
        clearLabel={dict.tutorials.clearFilters}
        hasActiveFilters={hasActiveFilters}
        onClear={clearAll}
        sections={sections}
      />

      {visibleRoutines.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRoutines.map((routine, index) => (
              <RoutineCard
                key={routine.slug}
                routine={routine}
                locale={locale}
                instructorName={instructorNameBySlug[routine.instructorSlug]}
                priority={index < 3}
                labels={{
                  viewRoutine: dict.tutorials.viewRoutine,
                  taughtBy: dict.tutorials.taughtBy,
                  favoriteAdd: dict.tutorials.favoriteAdd,
                  favoriteRemove: dict.tutorials.favoriteRemove,
                }}
              />
            ))}
          </div>
          {hasMore ? <div ref={sentinelRef} aria-hidden="true" className="h-1" /> : null}
        </>
      ) : (
        <p className="text-frame-silver">{dict.tutorials.empty}</p>
      )}
    </>
  );
}
