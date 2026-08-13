/**
 * External course types + **temporary in-memory mock partner listings**.
 * These are affiliate/paid courses hosted by third-party providers, not
 * content produced by The Frame — replace with real partner data (and real
 * affiliate links) when partnerships are confirmed.
 */

export interface ExternalCourseRecord {
  slug: string;
  /** MOCK provider name — replace with the real partner's brand name. */
  provider: string;
  /** Display-only price string; billing happens on the provider's site. */
  priceDisplay: string;
  /** Placeholder — replace with the provider's real affiliate/tracking link. */
  affiliateUrl: string;
  /** Controls display order; lower sorts first. */
  sortOrder: number;
}

/** @textScraped scripts/verify-mock-db-parity.ts may later locate this array by its literal `export const EXTERNAL_COURSES...` source text — keep it exported. */
export const EXTERNAL_COURSES: ExternalCourseRecord[] = [
  // MOCK partner courses for demo UI — replace with real affiliate listings when ready.
  {
    slug: "steez-academy-hiphop-foundations",
    provider: "Steez Academy",
    priceDisplay: "$29/mo",
    affiliateUrl: "https://example.com/steez-academy?ref=theframe",
    sortOrder: 0,
  },
  {
    slug: "urban-motion-jazzfunk-intensive",
    provider: "Urban Motion Studio",
    priceDisplay: "$149 one-time",
    affiliateUrl: "https://example.com/urban-motion?ref=theframe",
    sortOrder: 1,
  },
  {
    slug: "heels-and-heart-confidence-course",
    provider: "Heels & Heart",
    priceDisplay: "$39/mo",
    affiliateUrl: "https://example.com/heels-and-heart?ref=theframe",
    sortOrder: 2,
  },
  {
    slug: "movement-lab-contemporary-lines",
    provider: "The Movement Lab",
    priceDisplay: "$59/mo",
    affiliateUrl: "https://example.com/movement-lab?ref=theframe",
    sortOrder: 3,
  },
  {
    slug: "rhythm-collective-afrobeats-bootcamp",
    provider: "Rhythm Collective",
    priceDisplay: "$25/mo",
    affiliateUrl: "https://example.com/rhythm-collective?ref=theframe",
    sortOrder: 4,
  },
  {
    slug: "dancehall-society-vibes-101",
    provider: "Dancehall Society",
    priceDisplay: "$19/mo",
    affiliateUrl: "https://example.com/dancehall-society?ref=theframe",
    sortOrder: 5,
  },
];

export function getAllExternalCourses(): ExternalCourseRecord[] {
  return [...EXTERNAL_COURSES].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getExternalCourseBySlug(
  slug: string,
): ExternalCourseRecord | undefined {
  return EXTERNAL_COURSES.find((course) => course.slug === slug);
}
