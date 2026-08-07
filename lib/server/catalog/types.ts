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

export interface CatalogHealthResponse {
  ok: true;
  service: "the-frame-catalog";
  source: CatalogSource;
  now: string;
}
