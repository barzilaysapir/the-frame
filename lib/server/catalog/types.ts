/**
 * Catalog API DTOs — locale-ready payloads for the data server.
 * Keep these stable; swap the repository implementation (mocks → D1/CMS)
 * without changing route handlers or clients.
 */
import type {
  DanceStyleKey,
  LevelKey,
  TagKey,
  VideoChapter,
} from "@/lib/routines";
import type { Locale } from "@/lib/i18n/config";

export interface CatalogChapter extends VideoChapter {
  label: string;
}

/**
 * What kind of library item something is — the shared vocabulary every
 * "which item" reference uses (the library grid's `LibraryItem.kind`,
 * favorites' `item_type`, and anywhere else that needs to say "a routine
 * or an external course" without redefining its own copy of that split).
 *
 * `internal_course` is reserved for a future internally-hosted, multi-lesson
 * course — no catalog table/repository method backs it yet (see
 * migrations/0036), so nothing can produce one today.
 */
export type CatalogItemType = "lesson" | "internal_course" | "external_course";

export interface CatalogRoutine {
  slug: string;
  title: string;
  songName: string;
  artist: string;
  instructorSlug: string;
  level: LevelKey;
  levelLabel: string;
  style: DanceStyleKey;
  styleLabel: string;
  tags: TagKey[];
  bpm: string;
  length: string;
  lengthLabel: string;
  technique: string;
  description: string;
  poster: string;
  videoSrc: string;
  chapters: CatalogChapter[];
  pricing: {
    original: number;
    earlyBird: number;
  };
}

export interface CatalogInstructor {
  slug: string;
  name: string;
  role: string;
  bio: string;
  styles: DanceStyleKey[];
  avatar: string;
  instagramUrl: string;
  routineCount: number;
  courseCount: number;
}

/** Public-facing lesson metadata — deliberately excludes the R2 object key (server-only, resolved via `CatalogRepository.getExternalCourseLessonSource`). */
export interface CatalogExternalCourseLesson {
  id: string;
  title: string;
  /** False hides the player mirror control. Defaults to true. */
  allowMirror: boolean;
}

/** Icon keys mapped to a Lucide component in CourseFeatureGrid. */
export type CourseFeatureIcon = "sparkles" | "footprints" | "home" | "infinity";

export interface CatalogExternalCourseFeature {
  icon: CourseFeatureIcon;
  label: string;
}

export interface CatalogExternalCourse {
  slug: string;
  title: string;
  provider: string;
  instructorSlug: string | null;
  tagline: string;
  description: string;
  /** Optional caption above the curriculum chips (empty when unused). */
  curriculumHeading: string;
  /** Short curriculum topic labels, shown as chips below the description. */
  curriculumTopics: string[];
  /** Short icon+label format/logistics callouts (e.g. "no experience needed"). */
  features: CatalogExternalCourseFeature[];
  priceDisplay: string;
  coverImage: string;
  /** Public promo clip URL (`public/…`). Null when the course has no preview. */
  promoVideo: string | null;
  /** Poster for `promoVideo`. Null when there is no dedicated still. */
  promoPoster: string | null;
  style: DanceStyleKey;
  styleLabel: string;
  level: LevelKey;
  levelLabel: string;
  lessons: CatalogExternalCourseLesson[];
}

export type CatalogSource = "d1" | "mock";

export interface CatalogListResponse<T> {
  locale: Locale;
  source: CatalogSource;
  items: T[];
}

export interface CatalogItemResponse<T> {
  locale: Locale;
  source: CatalogSource;
  item: T;
}

/** `CatalogListResponse` plus pagination metadata — used by paginated list endpoints (e.g. `/api/v1/routines` for the library's infinite scroll). */
export interface CatalogPaginatedListResponse<T> extends CatalogListResponse<T> {
  total: number;
  hasMore: boolean;
}

export interface CatalogHealthResponse {
  ok: true;
  service: "the-frame-catalog";
  source: CatalogSource;
  now: string;
}
