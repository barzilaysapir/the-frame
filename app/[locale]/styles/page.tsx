import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleCard } from "@/components/StyleCard";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { resolveCatalog } from "@/lib/server/catalog";
import { STYLE_COVER_POSTERS, type DanceStyleKey } from "@/lib/routines";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 5 minutes instead of refetching D1 on every request.
export const revalidate = 300;

interface StylesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: StylesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.styles.title,
    description: dict.styles.subtitle,
  };
}

export default async function StylesPage({ params }: StylesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();
  const [routines, courses] = await Promise.all([
    repository.listRoutines(locale),
    repository.listExternalCourses(locale),
  ]);

  const styleCounts = new Map<
    DanceStyleKey,
    {
      style: DanceStyleKey;
      label: string;
      poster: string;
      routineCount: number;
      courseCount: number;
    }
  >();

  for (const routine of routines) {
    const existing = styleCounts.get(routine.style);
    if (existing) {
      existing.routineCount += 1;
    } else {
      styleCounts.set(routine.style, {
        style: routine.style,
        label: routine.styleLabel,
        poster: STYLE_COVER_POSTERS[routine.style] ?? routine.poster,
        routineCount: 1,
        courseCount: 0,
      });
    }
  }

  for (const course of courses) {
    if (!course.style) continue;
    const existing = styleCounts.get(course.style);
    if (existing) {
      existing.courseCount += 1;
    } else {
      styleCounts.set(course.style, {
        style: course.style,
        label: course.styleLabel ?? course.style,
        poster: STYLE_COVER_POSTERS[course.style] ?? course.coverImage,
        routineCount: 0,
        courseCount: 1,
      });
    }
  }

  const styles = [...styleCounts.values()].sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  );

  function countLabel(entry: (typeof styles)[number]): string {
    if (entry.courseCount > 0 && entry.routineCount === 0) {
      return entry.courseCount === 1
        ? dict.styles.courseOne
        : formatMessage(dict.styles.courseMany, { count: entry.courseCount });
    }
    return entry.routineCount === 1
      ? dict.styles.routineOne
      : formatMessage(dict.styles.routineMany, { count: entry.routineCount });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.styles.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.styles.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {styles.map((entry, index) => (
          <StyleCard
            key={entry.style}
            style={entry.style}
            label={entry.label}
            poster={entry.poster}
            countLabel={countLabel(entry)}
            locale={locale}
            priority={index < 3}
            browseAria={dict.styles.browseAria}
          />
        ))}
      </div>
    </main>
  );
}
