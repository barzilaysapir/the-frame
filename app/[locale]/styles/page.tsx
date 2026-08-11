import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleCard } from "@/components/StyleCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { resolveCatalog } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

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
  const routines = await repository.listRoutines(locale);

  const styleCounts = new Map<
    string,
    {
      style: (typeof routines)[number]["style"];
      label: string;
      poster: string;
      count: number;
    }
  >();
  for (const routine of routines) {
    const existing = styleCounts.get(routine.style);
    if (existing) {
      existing.count += 1;
    } else {
      styleCounts.set(routine.style, {
        style: routine.style,
        label: routine.styleLabel,
        poster: routine.poster,
        count: 1,
      });
    }
  }
  const styles = [...styleCounts.values()].sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  );

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
            routineCount={entry.count}
            locale={locale}
            priority={index < 3}
            labels={{
              routineOne: dict.styles.routineOne,
              routineMany: dict.styles.routineMany,
              browseAria: dict.styles.browseAria,
            }}
          />
        ))}
      </div>
    </main>
  );
}
