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
  style: DanceStyleKey;
  avatar: string;
  instagramUrl: string;
  routineCount: number;
}

/** Public-facing lesson metadata — deliberately excludes the R2 object key (server-only, resolved via `CatalogRepository.getExternalCourseLessonSource`). */
export interface CatalogExternalCourseLesson {
  id: string;
  title: string;
}

export interface CatalogExternalCourse {
  slug: string;
  title: string;
  provider: string;
  tagline: string;
  description: string;
  priceDisplay: string;
  coverImage: string;
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
