import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { DanceVideoPlayer } from "@/components/DanceVideoPlayer";
import { RoutineBreakdown, type RoutineDetail } from "@/components/RoutineBreakdown";
import { PricingCard } from "@/components/PricingCard";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import { SongCredit } from "@/components/SongCredit";
import { RoutineFilterTag } from "@/components/RoutineFilterTag";
import { isLocale } from "@/lib/i18n/config";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import { getCachedInstructor, getCachedRoutine } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

interface RoutinePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: RoutinePageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};

  const routine = await getCachedRoutine(localeParam, slug);
  if (!routine) return {};

  const instructor = await getCachedInstructor(
    localeParam,
    routine.instructorSlug,
  );
  const dict = await getDictionary(localeParam);

  return {
    title: formatMessage(dict.routine.metaTitle, {
      title: routine.title,
      style: routine.styleLabel,
    }),
    description: formatMessage(dict.routine.metaDescription, {
      title: routine.title,
      style: routine.styleLabel,
      instructor: instructor?.name ?? "",
    }),
  };
}

export default async function RoutinePage({ params }: RoutinePageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam;
  const dict = await getDictionary(locale);

  const routine = await getCachedRoutine(locale, slug);
  if (!routine) notFound();

  const instructor = await getCachedInstructor(
    locale,
    routine.instructorSlug,
  );

  const pricingLabels = {
    pricingNote: dict.routine.pricingNote,
    getAccessNow: dict.routine.getAccessNow,
    secureNote: dict.routine.secureNote,
    guarantees: dict.routine.guarantees,
  };

  const routineDetails: RoutineDetail[] = [
    { label: dict.routine.detailLength, value: routine.lengthLabel },
    { label: dict.routine.detailBpm, value: routine.bpm },
    { label: dict.routine.detailTechnique, value: routine.technique },
  ];

  return (
    <>
      <EarlyBirdBanner
        endsAt="2026-08-12T00:00:00Z"
        spotsRemaining={12}
        totalSpots={50}
        labels={{
          title: dict.routine.earlyBirdTitle,
          discount: dict.routine.earlyBirdDiscount,
          forFirst: dict.routine.earlyBirdFor,
          aria: dict.routine.earlyBirdAria,
          spots: dict.routine.earlyBirdSpots,
          unitDays: dict.routine.unitDays,
          unitHours: dict.routine.unitHours,
          unitMinutes: dict.routine.unitMinutes,
          unitSeconds: dict.routine.unitSeconds,
        }}
      />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <RoutineFilterTag
                  value={routine.style}
                  variant="style"
                  locale={locale}
                />
                <RoutineFilterTag
                  value={routine.level}
                  variant="level"
                  locale={locale}
                />
              </div>
              <SongCredit
                songName={routine.title}
                artist={routine.artist}
                size="hero"
              />
              {instructor ? (
                <div className="mt-5 flex items-center gap-3">
                  <InstructorAvatar
                    name={instructor.name}
                    src={instructor.avatar}
                  />
                  <p className="text-sm text-frame-silver">
                    {dict.routine.taughtBy}{" "}
                    <span className="font-medium text-white">
                      {instructor.name}
                    </span>
                  </p>
                </div>
              ) : null}
            </section>

            <DanceVideoPlayer
              src={routine.videoSrc}
              poster={routine.poster}
              title={formatMessage(dict.routine.previewTitle, {
                title: routine.title,
              })}
              chapters={routine.chapters}
              labels={dict.player}
              className="mb-10"
            />

            <RoutineBreakdown
              heading={dict.routine.includedHeading}
              details={routineDetails}
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PricingCard
                originalPrice={routine.pricing.original}
                discountedPrice={routine.pricing.earlyBird}
                checkoutHref={localePath(locale, `/checkout/${routine.slug}`)}
                loginErrors={dict.login.errors}
                labels={pricingLabels}
              />
            </div>
          </aside>
        </div>
      </main>

      <MobileStickyCta
        originalPrice={routine.pricing.original}
        discountedPrice={routine.pricing.earlyBird}
        checkoutHref={localePath(locale, `/checkout/${routine.slug}`)}
        ctaLabel={dict.routine.getAccessNow}
        loginErrors={dict.login.errors}
      />
    </>
  );
}
