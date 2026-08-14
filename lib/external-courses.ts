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
  /** Card/detail-page cover image. Reuses an existing generic routine poster as a placeholder, same as several routines already do, until real course art is ready. */
  coverImage: string;
  /**
   * Lessons with real, hosted video (gated behind login — see
   * lib/server/course-videos.ts). Array order is display order. Omitted/empty
   * for the still-mock "coming soon" listings.
   */
  lessons?: ExternalCourseLessonRecord[];
}

/** @textScraped scripts/verify-mock-db-parity.ts may later locate this array by its literal `export const EXTERNAL_COURSES...` source text — keep it exported. */
export const EXTERNAL_COURSES: ExternalCourseRecord[] = [
  {
    // Real course — first one actually being implemented (not a mock
    // "coming soon" stub). Sorted first so the one course visitors can
    // actually take leads the "more courses" cards. Studio name is folded
    // into the title; `provider` here credits the instructor.
    slug: "gisha-gmisha-foundations",
    provider: "יהל חייט",
    priceDisplay: "₪200",
    sortOrder: 0,
    coverImage: "/routine-posters/routine-poster-amber-loft.png",
    lessons: [
      {
        id: "warmup",
        r2Key: "external-courses/gisha-gmisha/foundations/warmup.mp4",
      },
      {
        id: "head-neck",
        r2Key: "external-courses/gisha-gmisha/foundations/head-neck.mp4",
      },
      {
        id: "shoulder-blades",
        r2Key: "external-courses/gisha-gmisha/foundations/shoulder-blades.mp4",
      },
      {
        id: "shoulder-blades-physio-exercise",
        r2Key: "external-courses/gisha-gmisha/foundations/shoulder-blades-physio-exercise.mp4",
      },
      {
        id: "spine-abs",
        r2Key: "external-courses/gisha-gmisha/foundations/spine-abs.mp4",
      },
    ],
  },
  // MOCK course listings for demo UI — replace with real course records when ready.
  {
    slug: "steez-academy-hiphop-foundations",
    provider: "Steez Academy",
    priceDisplay: "₪99/mo",
    sortOrder: 1,
    coverImage: "/routine-posters/routine-poster-street-cypher.png",
  },
  {
    slug: "urban-motion-jazzfunk-intensive",
    provider: "Urban Motion Studio",
    priceDisplay: "₪449 one-time",
    sortOrder: 2,
    coverImage: "/routine-posters/routine-poster-jazz-glow.png",
  },
  {
    slug: "heels-and-heart-confidence-course",
    provider: "Heels & Heart",
    priceDisplay: "₪129/mo",
    sortOrder: 3,
    coverImage: "/routine-posters/routine-poster-penthouse-heels.png",
  },
  {
    slug: "movement-lab-contemporary-lines",
    provider: "The Movement Lab",
    priceDisplay: "₪179/mo",
    sortOrder: 4,
    coverImage: "/routine-posters/routine-poster-spotlight-lyrical.png",
  },
  {
    slug: "rhythm-collective-afrobeats-bootcamp",
    provider: "Rhythm Collective",
    priceDisplay: "₪89/mo",
    sortOrder: 5,
    coverImage: "/routine-posters/routine-poster-afro-groove.png",
  },
  {
    slug: "dancehall-society-vibes-101",
    provider: "Dancehall Society",
    priceDisplay: "₪69/mo",
    sortOrder: 6,
    coverImage: "/routine-posters/routine-poster-dancehall-block.png",
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
