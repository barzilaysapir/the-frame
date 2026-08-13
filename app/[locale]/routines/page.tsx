import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalCourseCard } from "@/components/ExternalCourseCard";
import { RoutineFilters, type RoutineFilterSection } from "@/components/routines/RoutineFilters";
import { RoutineInfiniteGrid } from "@/components/routines/RoutineInfiniteGrid";
import type { DanceStyleKey, LevelKey } from "@/lib/routines";
import { routinesFilterHref } from "@/lib/routines";
import { formatMessage, getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { resolveCatalog } from "@/lib/server/catalog";
import type { CatalogInstructor, CatalogRoutine } from "@/lib/server/catalog/types";

// NOTE: this route reads `searchParams` (filter chips below), which opts the
// whole page into dynamic rendering in Next's non-Cache-Components model —
// `revalidate` has no effect here today. Left in place (harmless) since it's
// the correct fix if this page's filtering ever moves off server-side
// searchParams; the other catalog pages below don't have this constraint.
export const revalidate = 300;

// Initial/per-scroll page size for the library's infinite scroll. The first
// page is sliced in-memory from the already-fetched full (unfiltered) list
// below — cheap at today's catalog size and avoids an extra DB round trip on
// first load. Further pages are fetched by the client from
// `/api/v1/routines`, which does real LIMIT/OFFSET pagination in SQL.
const PAGE_SIZE = 12;

interface RoutinesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    instructor?: string;
    style?: string;
    level?: string;
  }>;
}

export async function generateMetadata({
  params,
}: Pick<RoutinesPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.tutorials.title,
    description: dict.tutorials.subtitle,
  };
}

interface BuildFilterSectionsArgs {
  dict: Dictionary;
  instructors: CatalogInstructor[];
  styles: DanceStyleKey[];
  levels: LevelKey[];
  allRoutines: CatalogRoutine[];
  selectedInstructors: string[];
  selectedStyles: string[];
  selectedLevels: string[];
  locale: Locale;
}

function toggleSelection(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

function multiSelectTriggerLabel(dict: Dictionary, selectedLabels: string[]): string {
  if (selectedLabels.length === 0) return dict.tutorials.filterAll;
  if (selectedLabels.length === 1) return selectedLabels[0];
  return formatMessage(dict.tutorials.filterSelectedCount, {
    count: selectedLabels.length,
  });
}

function buildFilterSections({
  dict,
  instructors,
  styles,
  levels,
  allRoutines,
  selectedInstructors,
  selectedStyles,
  selectedLevels,
  locale,
}: BuildFilterSectionsArgs): RoutineFilterSection[] {
  const teacherOptions = instructors.map((instructor) => ({
    label: instructor.name,
    active: selectedInstructors.includes(instructor.slug),
    href: routinesFilterHref({
      instructor: toggleSelection(selectedInstructors, instructor.slug),
      style: selectedStyles,
      level: selectedLevels,
      locale,
    }),
  }));

  const styleOptions = styles.map((item) => ({
    label: allRoutines.find((routine) => routine.style === item)?.styleLabel ?? item,
    active: selectedStyles.includes(item),
    href: routinesFilterHref({
      instructor: selectedInstructors,
      style: toggleSelection(selectedStyles, item),
      level: selectedLevels,
      locale,
    }),
  }));

  const levelOptions = levels.map((item) => ({
    label: allRoutines.find((routine) => routine.level === item)?.levelLabel ?? item,
    active: selectedLevels.includes(item),
    href: routinesFilterHref({
      instructor: selectedInstructors,
      style: selectedStyles,
      level: toggleSelection(selectedLevels, item),
      locale,
    }),
  }));

  return [
    {
      type: "multiselect",
      label: dict.tutorials.filterTeacher,
      options: teacherOptions,
      allHref: routinesFilterHref({ style: selectedStyles, level: selectedLevels, locale }),
      allLabel: dict.tutorials.filterAll,
      triggerLabel: multiSelectTriggerLabel(
        dict,
        teacherOptions.filter((option) => option.active).map((option) => option.label),
      ),
      showSearch: true,
      searchPlaceholder: dict.tutorials.filterTeacherSearchPlaceholder,
      searchAriaLabel: dict.tutorials.filterTeacherSearch,
      noMatchesLabel: dict.tutorials.filterTeacherNoMatches,
    },
    {
      type: "multiselect",
      label: dict.tutorials.filterStyle,
      options: styleOptions,
      allHref: routinesFilterHref({
        instructor: selectedInstructors,
        level: selectedLevels,
        locale,
      }),
      allLabel: dict.tutorials.filterAll,
      triggerLabel: multiSelectTriggerLabel(
        dict,
        styleOptions.filter((option) => option.active).map((option) => option.label),
      ),
      showSearch: false,
    },
    {
      type: "multiselect",
      label: dict.tutorials.filterLevel,
      options: levelOptions,
      allHref: routinesFilterHref({
        instructor: selectedInstructors,
        style: selectedStyles,
        locale,
      }),
      allLabel: dict.tutorials.filterAll,
      triggerLabel: multiSelectTriggerLabel(
        dict,
        levelOptions.filter((option) => option.active).map((option) => option.label),
      ),
      showSearch: false,
    },
  ];
}

export default async function RoutinesPage({
  params,
  searchParams,
}: RoutinesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();

  const {
    instructor: instructorSlug,
    style,
    level,
  } = await searchParams;

  const [allRoutines, instructors, externalCourses] = await Promise.all([
    repository.listRoutines(locale),
    repository.listInstructors(locale),
    repository.listExternalCourses(locale),
  ]);

  const styles = [...new Set(allRoutines.map((routine) => routine.style))];
  const levels = [...new Set(allRoutines.map((routine) => routine.level))];

  const selectedInstructors = instructorSlug
    ? instructorSlug.split(",").filter(Boolean)
    : [];
  const selectedStyles = style ? style.split(",").filter(Boolean) : [];
  const selectedLevels = level ? level.split(",").filter(Boolean) : [];

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

  const instructorNameBySlug = Object.fromEntries(
    instructors.map((instructor) => [instructor.slug, instructor.name]),
  );

  const hasActiveFilters = Boolean(
    selectedInstructors.length > 0 || selectedStyles.length > 0 || selectedLevels.length > 0,
  );

  const total = routines.length;
  const firstPage = routines.slice(0, PAGE_SIZE);
  const hasMoreInitial = total > firstPage.length;

  const resultLabel =
    total === 0
      ? dict.tutorials.resultNone
      : total === 1
        ? dict.tutorials.resultOne
        : formatMessage(dict.tutorials.resultMany, { count: total });

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.tutorials.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.tutorials.subtitle}</p>
      </div>

      <RoutineFilters
        ariaLabel={dict.tutorials.filterAria}
        resultLabel={resultLabel}
        clearLabel={dict.tutorials.clearFilters}
        hasActiveFilters={hasActiveFilters}
        clearHref={localePath(locale, "/routines")}
        sections={buildFilterSections({
          dict,
          instructors,
          styles,
          levels,
          allRoutines,
          selectedInstructors,
          selectedStyles,
          selectedLevels,
          locale,
        })}
      />

      {firstPage.length > 0 ? (
        <RoutineInfiniteGrid
          key={`${instructorSlug ?? ""}|${style ?? ""}|${level ?? ""}`}
          initialRoutines={firstPage}
          initialHasMore={hasMoreInitial}
          locale={locale}
          pageSize={PAGE_SIZE}
          filters={{
            instructor: instructorSlug,
            style,
            level,
          }}
          instructorNameBySlug={instructorNameBySlug}
          labels={{
            viewRoutine: dict.tutorials.viewRoutine,
            taughtBy: dict.tutorials.taughtBy,
            favoriteAdd: dict.tutorials.favoriteAdd,
            favoriteRemove: dict.tutorials.favoriteRemove,
            loadingMore: dict.tutorials.loadingMore,
          }}
        />
      ) : (
        <p className="text-frame-silver">{dict.tutorials.empty}</p>
      )}

      {externalCourses.length > 0 ? (
        <section className="mt-16 border-t border-frame-border pt-12">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
              {dict.externalCourses.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {externalCourses.map((course) => (
              <ExternalCourseCard
                key={course.slug}
                course={course}
                locale={locale}
                labels={{
                  comingSoonBadge: dict.externalCourses.comingSoonBadge,
                  providerPrefix: dict.externalCourses.providerPrefix,
                  cta: dict.externalCourses.cta,
                  linkAria: dict.externalCourses.linkAria,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
