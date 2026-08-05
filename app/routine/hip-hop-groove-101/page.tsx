import type { Metadata } from "next";
import { Award, Flame } from "lucide-react";
import { Header } from "@/components/Header";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { DanceVideoPlayer, type VideoChapter } from "@/components/DanceVideoPlayer";
import { RoutineBreakdown, type RoutineDetail } from "@/components/RoutineBreakdown";
import { PricingCard } from "@/components/PricingCard";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { InstructorAvatar } from "@/components/InstructorAvatar";

export const metadata: Metadata = {
  title: "Neon Nights — Commercial Groove Routine | The Frame by Barzilay",
  description:
    "Learn 'Neon Nights', a commercial groove routine taught by Jayden Cole. Full breakdown, mirrored practice mode, and slow-motion counts included.",
};

const ROUTINE = {
  title: "Neon Nights",
  instructor: "Jayden Cole",
  level: "Intermediate" as const,
  style: "Commercial",
  songName: "Neon Nights (Instrumental Edit)",
  bpm: "96 BPM",
  length: "3:42 run time",
  technique: "Isolations & grounded weight shifts",
  checkoutHref: "/checkout/neon-nights",
  pricing: {
    original: 59,
    earlyBird: 29,
  },
};

const VIDEO_CHAPTERS: VideoChapter[] = [
  { id: "full-performance", label: "Full Performance", time: 0 },
  { id: "breakdown", label: "Routine Breakdown (Counts)", time: 22 },
  { id: "slow-practice", label: "Slow Practice (50%)", time: 58 },
  { id: "full-speed", label: "Full Speed Practice (100%)", time: 96 },
];

const ROUTINE_DETAILS: RoutineDetail[] = [
  { icon: "length", label: "Length", value: ROUTINE.length },
  { icon: "bpm", label: "Tempo", value: ROUTINE.bpm },
  { icon: "song", label: "Song", value: ROUTINE.songName },
  { icon: "technique", label: "Key Technique Focus", value: ROUTINE.technique },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-frame-border bg-frame-panel px-3 py-1 text-xs font-medium text-frame-silver">
      {children}
    </span>
  );
}

export default function RoutinePage() {
  return (
    <>
      <Header />
      <EarlyBirdBanner endsAt="2026-08-12T00:00:00Z" spotsRemaining={12} totalSpots={50} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <section className="mb-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>
                  <Flame className="mr-1.5 h-3.5 w-3.5 text-frame-gold" />
                  {ROUTINE.style}
                </Badge>
                <Badge>
                  <Award className="mr-1.5 h-3.5 w-3.5 text-frame-gold" />
                  {ROUTINE.level}
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {ROUTINE.title}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <InstructorAvatar name={ROUTINE.instructor} />
                <p className="text-sm text-frame-silver">
                  Taught by{" "}
                  <span className="font-medium text-white">{ROUTINE.instructor}</span>
                </p>
              </div>
            </section>

            {/* Preview / promo video */}
            <DanceVideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="/routine-poster.svg"
              title={`${ROUTINE.title} — promo preview`}
              chapters={VIDEO_CHAPTERS}
              className="mb-10"
            />

            {/* Routine breakdown list */}
            <RoutineBreakdown details={ROUTINE_DETAILS} />
          </div>

          {/* Sticky pricing sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PricingCard
                originalPrice={ROUTINE.pricing.original}
                discountedPrice={ROUTINE.pricing.earlyBird}
                checkoutHref={ROUTINE.checkoutHref}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky CTA bar (mobile) */}
      <MobileStickyCta
        originalPrice={ROUTINE.pricing.original}
        discountedPrice={ROUTINE.pricing.earlyBird}
        checkoutHref={ROUTINE.checkoutHref}
      />
    </>
  );
}
