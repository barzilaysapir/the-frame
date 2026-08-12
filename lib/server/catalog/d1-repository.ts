import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogRepository } from "@/lib/server/catalog/repository";
import type {
  CatalogInstructor,
  CatalogRoutine,
  CatalogChapter,
} from "@/lib/server/catalog/types";
import type { AppDb } from "@/lib/server/db";
import type {
  ChapterId,
  DanceStyleKey,
  LevelKey,
  TagKey,
} from "@/lib/routines";

interface RoutineRow {
  slug: string;
  title: string;
  song_name: string;
  artist: string;
  instructor_slug: string;
  level: string;
  style: string;
  tags_json: string;
  bpm: string;
  length: string;
  poster: string;
  video_src: string;
  price_original: number;
  price_early_bird: number;
  technique: string | null;
  description: string | null;
  style_label: string | null;
  level_label: string | null;
  minutes_label: string | null;
}

interface InstructorRow {
  slug: string;
  style: string;
  avatar: string;
  instagram_url: string;
  name: string | null;
  bio: string | null;
  role: string | null;
  routine_count: number;
}

interface ChapterRow {
  chapter_id: string;
  time_seconds: number;
  label: string | null;
}

function parseTags(tagsJson: string): TagKey[] {
  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TagKey => typeof item === "string");
  } catch {
    return [];
  }
}

function mapRoutine(
  row: RoutineRow,
  chapters: CatalogChapter[],
): CatalogRoutine {
  const minutes = row.minutes_label ?? "";
  const lengthLabel = minutes ? `${row.length} ${minutes}` : row.length;

  return {
    slug: row.slug,
    title: row.title,
    songName: row.song_name,
    artist: row.artist,
    instructorSlug: row.instructor_slug,
    level: row.level as LevelKey,
    levelLabel: row.level_label ?? row.level,
    style: row.style as DanceStyleKey,
    styleLabel: row.style_label ?? row.style,
    tags: parseTags(row.tags_json),
    bpm: row.bpm,
    length: row.length,
    lengthLabel,
    technique: row.technique ?? "",
    description: row.description ?? "",
    poster: row.poster,
    videoSrc: row.video_src,
    chapters,
    pricing: {
      original: row.price_original,
      earlyBird: row.price_early_bird,
    },
  };
}

/** Chapters for a single routine, ordered by sort_order. */
async function fetchChaptersForSlug(
  db: AppDb,
  locale: Locale,
  slug: string,
): Promise<CatalogChapter[]> {
  const chapters = await db
    .prepare(
      `SELECT c.chapter_id, c.time_seconds, ci.label
       FROM routine_chapters c
       LEFT JOIN chapter_i18n ci
         ON ci.chapter_id = c.chapter_id AND ci.locale = ?
       WHERE c.routine_slug = ?
       ORDER BY c.sort_order ASC`,
    )
    .bind(locale, slug)
    .all<ChapterRow>();

  return (chapters.results ?? []).map((chapter: ChapterRow) => ({
    id: chapter.chapter_id as ChapterId,
    time: chapter.time_seconds,
    label: chapter.label ?? chapter.chapter_id,
  }));
}

/**
 * Chapters for *all* routines in one round trip, grouped by slug. Avoids an
 * N+1 query per routine when listing the full catalog (100+ rows).
 */
async function fetchChaptersForAllRoutines(
  db: AppDb,
  locale: Locale,
): Promise<Map<string, CatalogChapter[]>> {
  const result = await db
    .prepare(
      `SELECT c.routine_slug, c.chapter_id, c.time_seconds, ci.label
       FROM routine_chapters c
       LEFT JOIN chapter_i18n ci
         ON ci.chapter_id = c.chapter_id AND ci.locale = ?
       ORDER BY c.routine_slug ASC, c.sort_order ASC`,
    )
    .bind(locale)
    .all<ChapterRow & { routine_slug: string }>();

  const bySlug = new Map<string, CatalogChapter[]>();
  for (const chapter of result.results ?? []) {
    const list = bySlug.get(chapter.routine_slug) ?? [];
    list.push({
      id: chapter.chapter_id as ChapterId,
      time: chapter.time_seconds,
      label: chapter.label ?? chapter.chapter_id,
    });
    bySlug.set(chapter.routine_slug, list);
  }
  return bySlug;
}

const ROUTINE_SELECT = `
  SELECT
    r.slug, r.title, r.song_name, r.artist, r.instructor_slug, r.level, r.style,
    r.tags_json, r.bpm, r.length, r.poster, r.video_src,
    r.price_original, r.price_early_bird,
    ri.technique, ri.description,
    si.label AS style_label,
    li.label AS level_label,
    lm.minutes_label
  FROM routines r
  LEFT JOIN routine_i18n ri ON ri.slug = r.slug AND ri.locale = ?
  LEFT JOIN style_i18n si ON si.style_key = r.style AND si.locale = ?
  LEFT JOIN level_i18n li ON li.level_key = r.level AND li.locale = ?
  LEFT JOIN locale_meta lm ON lm.locale = ?
`;

export function createD1CatalogRepository(db: AppDb): CatalogRepository {
  return {
    async listRoutines(locale) {
      const [result, chaptersBySlug] = await Promise.all([
        db.prepare(ROUTINE_SELECT).bind(locale, locale, locale, locale).all<RoutineRow>(),
        fetchChaptersForAllRoutines(db, locale),
      ]);

      const rows: RoutineRow[] = result.results ?? [];
      return rows.map((row: RoutineRow) =>
        mapRoutine(row, chaptersBySlug.get(row.slug) ?? []),
      );
    },

    async getRoutine(locale, slug) {
      const [row, chapters] = await Promise.all([
        db
          .prepare(`${ROUTINE_SELECT} WHERE r.slug = ?`)
          .bind(locale, locale, locale, locale, slug)
          .first<RoutineRow>(),
        fetchChaptersForSlug(db, locale, slug),
      ]);

      if (!row) return null;
      return mapRoutine(row, chapters);
    },

    async listInstructors(locale) {
      const result = await db
        .prepare(
          `SELECT
             i.slug, i.style, i.avatar, i.instagram_url,
             ii.name, ii.bio,
             si.label AS role,
             (
               SELECT COUNT(*) FROM routines r WHERE r.instructor_slug = i.slug
             ) AS routine_count
           FROM instructors i
           LEFT JOIN instructor_i18n ii ON ii.slug = i.slug AND ii.locale = ?
           LEFT JOIN style_i18n si ON si.style_key = i.style AND si.locale = ?
           ORDER BY i.slug ASC`,
        )
        .bind(locale, locale)
        .all<InstructorRow>();

      return ((result.results ?? []) as InstructorRow[]).map(
        (row: InstructorRow) => ({
          slug: row.slug,
          name: row.name ?? row.slug,
          role: row.role ?? row.style,
          bio: row.bio ?? "",
          style: row.style as DanceStyleKey,
          avatar: row.avatar,
          instagramUrl: row.instagram_url,
          routineCount: Number(row.routine_count ?? 0),
        }),
      );
    },

    async getInstructor(locale, slug) {
      const row = await db
        .prepare(
          `SELECT
             i.slug, i.style, i.avatar, i.instagram_url,
             ii.name, ii.bio,
             si.label AS role,
             (
               SELECT COUNT(*) FROM routines r WHERE r.instructor_slug = i.slug
             ) AS routine_count
           FROM instructors i
           LEFT JOIN instructor_i18n ii ON ii.slug = i.slug AND ii.locale = ?
           LEFT JOIN style_i18n si ON si.style_key = i.style AND si.locale = ?
           WHERE i.slug = ?`,
        )
        .bind(locale, locale, slug)
        .first<InstructorRow>();

      if (!row) return null;

      const instructor: CatalogInstructor = {
        slug: row.slug,
        name: row.name ?? row.slug,
        role: row.role ?? row.style,
        bio: row.bio ?? "",
        style: row.style as DanceStyleKey,
        avatar: row.avatar,
        instagramUrl: row.instagram_url,
        routineCount: Number(row.routine_count ?? 0),
      };
      return instructor;
    },
  };
}
