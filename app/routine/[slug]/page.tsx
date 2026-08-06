import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { DanceVideoPlayer } from "@/components/DanceVideoPlayer";
import { RoutineBreakdown, type RoutineDetail } from "@/components/RoutineBreakdown";
import { PricingCard } from "@/components/PricingCard";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import { getAllRoutines, getRoutineBySlug } from "@/lib/routines";
import { getInstructorBySlug } from "@/lib/instructors";

interface RoutinePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllRoutines().map((routine) => ({ slug: routine.slug }));
}

export async function generateMetadata({
  params,
}: RoutinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const routine = getRoutineBySlug(slug);
  if (!routine) return {};

  const instructor = getInstructorBySlug(routine.instructorSlug);

  return {
    title: `${routine.title} — רוטינת ${routine.style} | The Frame by Barzilay`,
    description: `למדו את '${routine.title}', רוטינת ${routine.style} בהנחיית ${instructor?.name ?? ""}. פירוק מלא, מצב תרגול במראה וספירות בהאטה כלולים.`,
  };
}

export default async function RoutinePage({ params }: RoutinePageProps) {
  const { slug } = await params;
  const routine = getRoutineBySlug(slug);
  if (!routine) notFound();

  const instructor = getInstructorBySlug(routine.instructorSlug);

  const routineDetails: RoutineDetail[] = [
    { label: "אורך", value: routine.length },
    { label: "קצב", value: routine.bpm },
    { label: "שיר", value: `${routine.songName} — ${routine.artist}` },
    { label: "דגש טכני מרכזי", value: routine.technique },
  ];

  return (
    <>
      <Header />
      <EarlyBirdBanner endsAt="2026-08-12T00:00:00Z" spotsRemaining={12} totalSpots={50} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-frame-magenta px-3 py-1 text-xs font-bold text-frame-bg">
                  {routine.style}
                </span>
                <span className="rounded-full border border-frame-cyan/60 px-3 py-1 text-xs font-bold text-frame-cyan">
                  {routine.level}
                </span>
              </div>
              <h1 className="text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl">
                {routine.title}
              </h1>
              {instructor && (
                <div className="mt-5 flex items-center gap-3">
                  <InstructorAvatar name={instructor.name} />
                  <p className="text-sm text-frame-silver">
                    בהנחיית{" "}
                    <span className="font-medium text-white">{instructor.name}</span>
                  </p>
                </div>
              )}
            </section>

            {/* Preview / promo video */}
            <DanceVideoPlayer
              src={routine.videoSrc}
              poster={routine.poster}
              title={`${routine.title} — תצוגה מקדימה`}
              chapters={routine.chapters}
              className="mb-10"
            />

            {/* Routine breakdown list */}
            <RoutineBreakdown details={routineDetails} />
          </div>

          {/* Sticky pricing sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PricingCard
                originalPrice={routine.pricing.original}
                discountedPrice={routine.pricing.earlyBird}
                checkoutHref={routine.checkoutHref}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky CTA bar (mobile) */}
      <MobileStickyCta
        originalPrice={routine.pricing.original}
        discountedPrice={routine.pricing.earlyBird}
        checkoutHref={routine.checkoutHref}
      />
    </>
  );
}
