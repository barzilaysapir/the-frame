/**
 * "More courses" types + **temporary in-memory mock listings**.
 * These are additional courses filmed/produced by The Frame that live on
 * this site (own instructors, own hosting) but are kept in a separate
 * section from the main routines catalog because they're a different kind
 * of content — e.g. stretching/warm-up series instead of song combinations.
 * Not third-party/affiliate — replace with real course records when ready.
 */

interface ExternalCourseLessonRecord {
  id: string;
  /** Object key inside the private `the-frame-class-videos` R2 bucket — never sent to the client, only read server-side to stream/sign playback. */
  r2Key: string;
}

export interface ExternalCourseRecord {
  slug: string;
  /** MOCK creator/series name — replace with the real one when ready. */
  provider: string;
  /** Display-only price string, in ILS (₪) — this is an Israel-only business, same as routine pricing. */
  priceDisplay: string;
  /** Controls display order; lower sorts first. */
  sortOrder: number;
  /**
   * Lessons with real, hosted video (gated behind login — see
   * lib/server/course-videos.ts). Array order is display order. Omitted/empty
   * for the still-mock "coming soon" listings.
   */
  lessons?: ExternalCourseLessonRecord[];
}

/** @textScraped scripts/verify-mock-db-parity.ts may later locate this array by its literal `export const EXTERNAL_COURSES...` source text — keep it exported. */
export const EXTERNAL_COURSES: ExternalCourseRecord[] = [
  // MOCK course listings for demo UI — replace with real course records when ready.
  {
    slug: "steez-academy-hiphop-foundations",
    provider: "Steez Academy",
    priceDisplay: "₪99/mo",
    sortOrder: 0,
  },
  {
    slug: "urban-motion-jazzfunk-intensive",
    provider: "Urban Motion Studio",
    priceDisplay: "₪449 one-time",
    sortOrder: 1,
  },
  {
    slug: "heels-and-heart-confidence-course",
    provider: "Heels & Heart",
    priceDisplay: "₪129/mo",
    sortOrder: 2,
  },
  {
    slug: "movement-lab-contemporary-lines",
    provider: "The Movement Lab",
    priceDisplay: "₪179/mo",
    sortOrder: 3,
  },
  {
    slug: "rhythm-collective-afrobeats-bootcamp",
    provider: "Rhythm Collective",
    priceDisplay: "₪89/mo",
    sortOrder: 4,
  },
  {
    slug: "dancehall-society-vibes-101",
    provider: "Dancehall Society",
    priceDisplay: "₪69/mo",
    sortOrder: 5,
  },
  {
    // Real course — first one actually being implemented (not a mock
    // "coming soon" stub). Price is a placeholder until confirmed.
    slug: "gisha-gmisha-foundations",
    provider: "גישה גמישה",
    priceDisplay: "מחיר בקרוב",
    sortOrder: 6,
    lessons: [
      {
        id: "warmup",
        r2Key: "external-courses/gisha-gmisha/foundations/warmup.mp4",
      },
    ],
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
