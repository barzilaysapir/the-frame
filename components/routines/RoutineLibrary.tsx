"use client";

import { useMemo } from "react";
import { ExternalCourseCard } from "@/components/ExternalCourseCard";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineFilters, type RoutineFilterSection } from "@/components/routines/RoutineFilters";
import { useInfiniteReveal } from "@/components/routines/useInfiniteReveal";
import { useRoutineFilters } from "@/components/routines/useRoutineFilters";
import type { LibraryItem } from "@/components/routines/libraryItem";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage, getDictionarySync } from "@/lib/i18n/get-dictionary";
import { localizeLevel, localizeStyle } from "@/lib/i18n/localize";
import type { DanceStyleKey, LevelKey } from "@/lib/routines";
import type { CatalogInstructor } from "@/lib/server/catalog/types";

interface RoutineLibraryProps {
  locale: Locale;
  allItems: LibraryItem[];
  instructors: CatalogInstructor[];
  styles: DanceStyleKey[];
  levels: LevelKey[];
  initialInstructors: string[];
  initialStyles: string[];
  initialLevels: string[];
  pageSize: number;
}

/** Filters/paginates the already-fetched catalog client-side, instead of navigating per click. */
export function RoutineLibrary({
  locale,
  allItems,
  instructors,
  styles,
  levels,
  initialInstructors,
  initialStyles,
  initialLevels,
  pageSize,
}: RoutineLibraryProps) {
  const dict = getDictionarySync(locale);

  const filters = useRoutineFilters({
    locale,
    allItems,
    initialInstructors,
    initialStyles,
    initialLevels,
  });
  const { visibleCount, hasMore, sentinelRef, reset: resetVisibleCount } = useInfiniteReveal(
    filters.filteredItems.length,
    pageSize,
  );

  // Any filter change starts pagination over — composed here rather than
  // inside either hook, since neither needs to know the other exists.
  function toggleInstructor(value: string) {
    filters.toggleInstructor(value);
    resetVisibleCount();
  }
  function toggleStyle(value: string) {
    filters.toggleStyle(value);
    resetVisibleCount();
  }
  function toggleLevel(value: string) {
    filters.toggleLevel(value);
    resetVisibleCount();
  }
  function clearInstructors() {
    filters.clearInstructors();
    resetVisibleCount();
  }
  function clearStyles() {
    filters.clearStyles();
    resetVisibleCount();
  }
  function clearLevels() {
    filters.clearLevels();
    resetVisibleCount();
  }
  function clearAll() {
    filters.clearAll();
    resetVisibleCount();
  }

  const instructorNameBySlug = useMemo(
    () => Object.fromEntries(instructors.map((instructor) => [instructor.slug, instructor.name])),
    [instructors],
  );

  const teacherOptions = instructors.map((instructor) => ({
    label: instructor.name,
    value: instructor.slug,
    active: filters.selectedInstructors.includes(instructor.slug),
  }));
  const styleOptions = styles.map((item) => ({
    label: localizeStyle(locale, item),
    value: item,
    active: filters.selectedStyles.includes(item),
  }));
  const levelOptions = levels.map((item) => ({
    label: localizeLevel(locale, item),
    value: item,
    active: filters.selectedLevels.includes(item),
  }));

  const optionRemoveAriaLabel = (name: string) =>
    formatMessage(dict.tutorials.filterRemoveOption, { name });

  const sections: RoutineFilterSection[] = [
    {
      type: "multiselect",
      label: dict.tutorials.filterTeacher,
      options: teacherOptions,
      onToggle: toggleInstructor,
      onClear: clearInstructors,
      clearLabel: dict.tutorials.filterClearOne,
      placeholder: dict.tutorials.filterTeacherPlaceholder,
      optionRemoveAriaLabel,
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
      onClear: clearStyles,
      clearLabel: dict.tutorials.filterClearOne,
      placeholder: dict.tutorials.filterStylePlaceholder,
      optionRemoveAriaLabel,
      showSearch: false,
    },
    {
      type: "multiselect",
      label: dict.tutorials.filterLevel,
      options: levelOptions,
      onToggle: toggleLevel,
      onClear: clearLevels,
      clearLabel: dict.tutorials.filterClearOne,
      placeholder: dict.tutorials.filterLevelPlaceholder,
      optionRemoveAriaLabel,
      showSearch: false,
    },
  ];

  const total = filters.filteredItems.length;
  const resultLabel =
    total === 0
      ? dict.tutorials.resultNone
      : total === 1
        ? dict.tutorials.resultOne
        : formatMessage(dict.tutorials.resultMany, { count: total });

  const visibleItems = filters.filteredItems.slice(0, visibleCount);

  return (
    <>
      <RoutineFilters
        ariaLabel={dict.tutorials.filterAria}
        resultLabel={resultLabel}
        clearLabel={dict.tutorials.clearFilters}
        hasActiveFilters={filters.hasActiveFilters}
        onClear={clearAll}
        sections={sections}
      />

      {visibleItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) =>
              item.kind === "routine" ? (
                <RoutineCard
                  key={item.routine.slug}
                  routine={item.routine}
                  locale={locale}
                  instructorName={instructorNameBySlug[item.routine.instructorSlug]}
                  priority={index < 3}
                  labels={{
                    viewRoutine: dict.tutorials.viewRoutine,
                    taughtBy: dict.tutorials.taughtBy,
                    favoriteAdd: dict.tutorials.favoriteAdd,
                    favoriteRemove: dict.tutorials.favoriteRemove,
                  }}
                />
              ) : (
                <ExternalCourseCard
                  key={item.course.slug}
                  course={item.course}
                  locale={locale}
                  priority={index < 3}
                  labels={{
                    externalCourseTag: dict.externalCourses.tag,
                    comingSoonBadge: dict.externalCourses.comingSoonBadge,
                    availableBadge: dict.externalCourses.availableBadge,
                    taughtBy: dict.tutorials.taughtBy,
                    cta: dict.externalCourses.cta,
                    linkAria: dict.externalCourses.linkAria,
                  }}
                />
              ),
            )}
          </div>
          {hasMore ? <div ref={sentinelRef} aria-hidden="true" className="h-1" /> : null}
          {/* Announces newly-revealed cards to screen readers as visibleCount grows. */}
          <p aria-live="polite" className="sr-only">
            {formatMessage(dict.tutorials.libraryLoadedStatus, {
              shown: visibleItems.length,
              total,
            })}
          </p>
        </>
      ) : (
        <p className="text-frame-silver">{dict.tutorials.empty}</p>
      )}
    </>
  );
}
