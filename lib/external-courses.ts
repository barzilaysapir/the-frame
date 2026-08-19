/**
 * "More courses" types + in-memory records, backing the demo/preview
 * catalog (mockCatalogRepository). These are additional courses
 * filmed/produced by The Frame that live on this site (own instructors, own
 * hosting) but are kept in a separate section from the main routines
 * catalog because they're a different kind of content — e.g. stretching/
 * warm-up series instead of song combinations. Mirrors the real D1
 * `external_courses` table (see migrations/) — keep the two in sync.
 */
import type { DanceStyleKey, LevelKey } from "@/lib/routines";

interface ExternalCourseLessonRecord {
  id: string;
  /** Object key inside the private `the-frame-class-videos` R2 bucket — never sent to the client, only read server-side to stream/sign playback. */
  r2Key: string;
  /**
   * When false, the player hides the mirror control and does not flip.
   * Omit or true to show the control and start mirrored. Set false for
   * lessons that are already mirrored in edit or have burned-in captions.
   */
  allowMirror?: boolean;
}

export interface ExternalCourseRecord {
  slug: string;
  provider: string;
  /** Real instructor slug this course belongs to, when it's taught by someone in the instructors catalog. */
  instructorSlug?: string;
  /** Display-only price string, in ILS (₪) — this is an Israel-only business, same as routine pricing. */
  priceDisplay: string;
  /** Controls display order; lower sorts first. */
  sortOrder: number;
  /** Card/detail-page cover image. Reuses an existing generic routine poster as a placeholder, same as several routines already do, until real course art is ready. */
  coverImage: string;
  /** Library style this course belongs to — same as routines, required so every course shows up in style filters. */
  style: DanceStyleKey;
  /** Library level — same as routines, required so every course shows up in level filters. */
  level: LevelKey;
  /**
   * Lessons with real, hosted video (gated behind login — see
   * lib/server/course-videos.ts). Array order is display order. Omitted/empty
   * for courses that don't have lessons live yet.
   */
  lessons?: ExternalCourseLessonRecord[];
}

export const EXTERNAL_COURSES: ExternalCourseRecord[] = [
  {
    // Real course — first one actually being implemented (not a mock
    // "coming soon" stub). Sorted first so the one course visitors can
    // actually take leads the "more courses" cards. Studio name is folded
    // into the title; `provider` here credits the instructor.
    slug: "gisha-gmisha-foundations",
    provider: "יהל חייט",
    instructorSlug: "yahel-hayat",
    priceDisplay: "₪200",
    sortOrder: 0,
    coverImage: "/course-covers/gisha-gmisha-foundations.jpg",
    style: "flexibility-technique",
    level: "beginner",
    lessons: [
      {
        id: "warmup",
        r2Key: "class-videos/external-courses/gisha-gmisha/foundations/warmup.mp4",
        allowMirror: false,
      },
      {
        id: "head-neck",
        r2Key: "class-videos/external-courses/gisha-gmisha/foundations/head-neck.mp4",
        allowMirror: false,
      },
      {
        id: "shoulder-blades",
        r2Key: "class-videos/external-courses/gisha-gmisha/foundations/shoulder-blades.mp4",
        allowMirror: false,
      },
      {
        id: "shoulder-blades-physio-exercise",
        r2Key: "class-videos/external-courses/gisha-gmisha/foundations/shoulder-blades-physio-exercise.mp4",
        allowMirror: false,
      },
      {
        id: "spine-abs",
        r2Key: "class-videos/external-courses/gisha-gmisha/foundations/spine-abs.mp4",
        allowMirror: false,
      },
    ],
  },
  {
    // Second real course — no lessons yet, card-only, same starting point as
    // gisha-gmisha-foundations before migrations/0017.
    slug: "vibe-on-heels",
    provider: "דניאל לאני",
    instructorSlug: "daniel-lani",
    priceDisplay: "בקרוב",
    sortOrder: 7,
    coverImage: "/course-covers/vibe-on-heels.png",
    style: "heels",
    level: "all-levels",
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
