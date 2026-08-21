import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { CheckoutPlans } from "@/components/checkout/CheckoutPlans";
import { RoutineBreakdown, type RoutineDetail } from "@/components/routines/RoutineBreakdown";
import { RoutineVideoPlayer } from "@/components/routines/RoutineVideoPlayer";
import { SongCredit } from "@/components/routines/SongCredit";
import { RoutineFilterTag } from "@/components/routines/RoutineFilterTag";
import { isLocale } from "@/lib/i18n/config";
import { formatMessage, getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/path";
import { getCachedInstructor, getCachedRoutine } from "@/lib/server/catalog";
import { pageShareMetadata, resolveShareOrigin } from "@/lib/share-metadata";

// Seed-catalog data changes rarely (via migrations, not user writes) — cache
// the rendered page for 1 hour instead of refetching D1 on every request.
export const revalidate = 3600;

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

  const title = formatMessage(dict.routine.metaTitle, {
    title: routine.title,
    style: routine.styleLabel,
  });
  const description = formatMessage(dict.routine.metaDescription, {
    title: routine.title,
    style: routine.styleLabel,
    instructor: instructor?.name ?? "",
  });

  return pageShareMetadata({
    title,
    description,
    image: routine.poster,
    imageAlt: routine.title,
    origin: await resolveShareOrigin(),
  });
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

      <main className="relative min-h-screen overflow-hidden">
        <div className="neon-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
          <Link
            href={localePath(locale, "/routines")}
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-frame-silver underline underline-offset-4 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
            {dict.common.backToLibrary}
          </Link>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <RoutineFilterTag value={routine.style} variant="style" locale={locale} />
              <RoutineFilterTag value={routine.level} variant="level" locale={locale} />
            </div>
            <div className="mt-5">
              <SongCredit songName={routine.title} artist={routine.artist} size="hero" />
            </div>
            {instructor ? (
              <p className="mt-3 text-sm text-frame-silver">
                {dict.routine.taughtBy}{" "}
                <Link
                  href={localePath(locale, "/instructors")}
                  className="font-medium text-white transition-colors hover:text-frame-cyan"
                >
                  {instructor.name}
                </Link>
              </p>
            ) : null}
          </div>

          <div className="mt-10">
            <RoutineVideoPlayer
              slug={routine.slug}
              poster={routine.poster}
              title={formatMessage(dict.routine.previewTitle, {
                title: routine.title,
              })}
              chapters={routine.chapters}
              checkoutHref={localePath(locale, `/routine/${routine.slug}#checkout`)}
              playerLabels={dict.player}
              loginErrors={dict.login.errors}
              labels={{
                signInPrompt: dict.routine.signInPrompt,
                signInCta: dict.routine.signInCta,
                loading: dict.routine.loadingVideo,
                unavailable: dict.routine.videoUnavailable,
                purchaseRequired: dict.routine.purchaseRequired,
                purchaseRequiredCta: dict.routine.purchaseRequiredCta,
              }}
            />
          </div>

          <div className="mt-10">
            <RoutineBreakdown
              heading={dict.routine.includedHeading}
              details={routineDetails}
            />
          </div>

          <div id="checkout" className="mt-12 border-t border-frame-border pt-10">
            <CheckoutPlans
              locale={locale}
              routineSlug={routine.slug}
              rentalOriginalPrice={routine.pricing.original}
              rentalPrice={routine.pricing.earlyBird}
              labels={dict.checkout}
              loginErrors={dict.login.errors}
              continueGoogleLabel={dict.login.continueGoogle}
              termsDict={dict.terms}
              closeLabel={dict.common.close}
            />
          </div>
        </div>
      </main>
    </>
  );
}
