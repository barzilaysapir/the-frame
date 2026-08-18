import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstructorCard } from "@/components/instructors/InstructorCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { resolveCatalog } from "@/lib/server/catalog";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 1 hour instead of refetching D1 on every request.
// Kept long to limit Workers KV op volume on the ISR cache (free-tier daily
// cap) — see https://github.com/barzilaysapir/the-frame/issues/271.
export const revalidate = 3600;

interface InstructorsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: InstructorsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.teachers.title,
    description: dict.teachers.subtitle,
  };
}

export default async function InstructorsPage({ params }: InstructorsPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const { repository } = await resolveCatalog();
  const instructors = await repository.listInstructors(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
          {dict.teachers.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.teachers.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <InstructorCard
            key={instructor.slug}
            instructor={instructor}
            locale={locale}
            labels={{
              routineOne: dict.teachers.routineOne,
              routineMany: dict.teachers.routineMany,
              courseOne: dict.teachers.courseOne,
              courseMany: dict.teachers.courseMany,
              instagramAria: dict.teachers.instagramAria,
              tutorialsAria: dict.teachers.tutorialsAria,
              avatarEnlargeAria: dict.teachers.avatarEnlargeAria,
              avatarLightboxClose: dict.teachers.avatarLightboxClose,
            }}
          />
        ))}
      </div>
    </main>
  );
}
