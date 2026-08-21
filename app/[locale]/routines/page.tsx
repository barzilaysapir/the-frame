import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoutineLibrary } from "@/components/routines/RoutineLibrary";
import type { LibraryItem } from "@/components/routines/libraryItem";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { LEVEL_ORDER, STYLE_ORDER } from "@/lib/routines";
import { resolveCatalog } from "@/lib/server/catalog";

// NOTE: this route reads `searchParams` only to seed the *initial* filter
// selection (so a shared/bookmarked filtered link still SSRs correctly and
// works without JS) — `revalidate` has no effect here today since that opts
// the whole page into dynamic rendering in Next's non-Cache-Components
// model. Every filter interaction after first load happens client-side in
// RoutineLibrary and never re-hits this route; see the comment there for why.
export const revalidate = 300;

// Initial/per-scroll page size for the library's infinite scroll. The full
// catalog is fetched once here (cheap at today's ~100-routine size) and
// handed to the client, which filters and slices it locally — no further
// server round-trips for filtering or pagination.
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
  };
}

export default async function RoutinesPage({ params, searchParams }: RoutinesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();

  const { instructor: instructorSlug, style, level } = await searchParams;

  const [allRoutines, instructors, externalCourses] = await Promise.all([
    repository.listRoutines(locale),
    repository.listInstructors(locale),
    repository.listExternalCourses(locale),
  ]);

  const styles = STYLE_ORDER;
  // Fixed, always-shown, canonically ordered — not derived from which
  // routines currently exist, so a level with 0 routines today still shows.
  const levels = LEVEL_ORDER;

  // A course with real, watchable lessons is content, same as a routine — it
  // leads the grid rather than sitting in an external-courses cluster.
  // Still-mock "coming soon" stubs (no lessons yet, nothing to watch) stay
  // appended after routines.
  const availableCourses = externalCourses.filter((course) => course.lessons.length > 0);
  const comingSoonCourses = externalCourses.filter((course) => course.lessons.length === 0);
  const allItems: LibraryItem[] = [
    ...availableCourses.map((course) => ({ kind: "external_course" as const, course })),
    ...allRoutines.map((routine) => ({ kind: "lesson" as const, routine })),
    ...comingSoonCourses.map((course) => ({ kind: "external_course" as const, course })),
  ];

  const initialInstructors = instructorSlug ? instructorSlug.split(",").filter(Boolean) : [];
  const initialStyles = style ? style.split(",").filter(Boolean) : [];
  const initialLevels = level ? level.split(",").filter(Boolean) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.tutorials.title}
        </h1>
      </div>

      <RoutineLibrary
        // Forces a remount when an external link (e.g. a style tag on a
        // RoutineCard) lands on this page with a different filter preset.
        key={`${instructorSlug ?? ""}|${style ?? ""}|${level ?? ""}`}
        locale={locale}
        allItems={allItems}
        instructors={instructors}
        styles={styles}
        levels={levels}
        initialInstructors={initialInstructors}
        initialStyles={initialStyles}
        initialLevels={initialLevels}
        pageSize={PAGE_SIZE}
      />
    </main>
  );
}
