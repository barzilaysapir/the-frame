import "server-only";
import type { Locale } from "@/lib/i18n/config";
import {
  splitFilterValues,
  type CatalogRepository,
  type RoutineFilters,
  type RoutinePagination,
} from "@/lib/server/catalog/repository";
import type {
  CatalogExternalCourse,
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
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";

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

interface ExternalCourseRow {
  slug: string;
  provider: string;
  price_display: string;
  cover_image: string;
  style: string | null;
  title: string | null;
  tagline: string | null;
  description: string | null;
  style_label: string | null;
}

interface ExternalCourseLessonRow {
  lesson_id: string;
  title: string | null;
  allow_mirror: number | null;
}

function parseTags(tagsJson: string, routineSlug: string): TagKey[] {
  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TagKey => typeof item === "string");
  } catch (error) {
    console.error(
      `Malformed tags_json for routine "${routineSlug}" (length ${tagsJson.length}):`,
      error,
    );
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
    tags: parseTags(row.tags_json, row.slug),
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

function mapExternalCourse(
  row: ExternalCourseRow,
  lessons: CatalogExternalCourse["lessons"],
): CatalogExternalCourse {
  return {
    slug: row.slug,
    title: row.title ?? row.slug,
    provider: row.provider,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    priceDisplay: row.price_display,
    coverImage: row.cover_image,
    style: (row.style as DanceStyleKey | null) ?? null,
    styleLabel: row.style ? (row.style_label ?? row.style) : null,
    lessons,
  };
}

/** Lessons for a single course, ordered by sort_order — mirrors `fetchChaptersForSlug`. */
async function fetchLessonsForSlug(
  db: AppDb,
  locale: Locale,
  courseSlug: string,
): Promise<CatalogExternalCourse["lessons"]> {
  const result = await db
    .prepare(
      `SELECT l.lesson_id, l.allow_mirror, li.title
       FROM external_course_lessons l
       LEFT JOIN external_course_lesson_i18n li
         ON li.course_slug = l.course_slug AND li.lesson_id = l.lesson_id AND li.locale = ?
       WHERE l.course_slug = ?
       ORDER BY l.sort_order ASC`,
    )
    .bind(locale, courseSlug)
    .all<ExternalCourseLessonRow>();

  return (result.results ?? []).map((row: ExternalCourseLessonRow) => ({
    id: row.lesson_id,
    title: row.title ?? row.lesson_id,
    allowMirror: row.allow_mirror !== 0,
  }));
}

/**
 * Lessons for *all* external courses in one round trip, grouped by course
 * slug — avoids an N+1 query when listing the catalog (mirrors
 * `fetchChaptersForAllRoutines`). The course count here is small, but the
 * pattern stays consistent with the rest of this file.
 */
async function fetchLessonsForAllExternalCourses(
  db: AppDb,
  locale: Locale,
): Promise<Map<string, CatalogExternalCourse["lessons"]>> {
  const result = await db
    .prepare(
      `SELECT l.course_slug, l.lesson_id, l.allow_mirror, li.title
       FROM external_course_lessons l
       LEFT JOIN external_course_lesson_i18n li
         ON li.course_slug = l.course_slug AND li.lesson_id = l.lesson_id AND li.locale = ?
       ORDER BY l.course_slug ASC, l.sort_order ASC`,
    )
    .bind(locale)
    .all<ExternalCourseLessonRow & { course_slug: string }>();

  const bySlug = new Map<string, CatalogExternalCourse["lessons"]>();
  for (const row of result.results ?? []) {
    const list = bySlug.get(row.course_slug) ?? [];
    list.push({
      id: row.lesson_id,
      title: row.title ?? row.lesson_id,
      allowMirror: row.allow_mirror !== 0,
    });
    bySlug.set(row.course_slug, list);
  }
  return bySlug;
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
 * N+1 query per routine when listing the catalog (100+ rows).
 *
 * Deliberately unscoped by slug (not `WHERE routine_slug IN (...)`): D1 caps
 * bound parameters per statement at 100, so an IN-list sized to the routine
 * count would break once the catalog itself reaches ~100 rows (it already
 * has). The chapters table is small regardless of how the routines query is
 * filtered, so one flat query bound only to `locale` stays well under the
 * limit and the caller just looks up the slugs it needs from the map.
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

/** Shared WHERE-clause builder for `listRoutines`/`countRoutines` so the two never drift apart. */
function buildRoutineWhereClause(filters?: RoutineFilters): {
  whereClause: string;
  params: string[];
} {
  const conditions: string[] = [];
  const params: string[] = [];

  function pushInClause(column: string, rawValue?: string) {
    const values = splitFilterValues(rawValue);
    if (values.length === 0) return;
    conditions.push(`${column} IN (${values.map(() => "?").join(", ")})`);
    params.push(...values);
  }

  pushInClause("r.instructor_slug", filters?.instructor);
  pushInClause("r.style", filters?.style);
  pushInClause("r.level", filters?.level);

  return {
    whereClause: conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
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
    async listRoutines(
      locale,
      filters?: RoutineFilters,
      pagination?: RoutinePagination,
    ) {
      const { whereClause, params } = buildRoutineWhereClause(filters);
      // `r.slug` (the primary key) gives a stable, deterministic order —
      // required so LIMIT/OFFSET pages don't skip or repeat rows across
      // successive infinite-scroll requests.
      let query = `${ROUTINE_SELECT}${whereClause} ORDER BY r.slug ASC`;
      const bindParams: Array<string | number> = [
        locale,
        locale,
        locale,
        locale,
        ...params,
      ];
      if (pagination) {
        query += ` LIMIT ? OFFSET ?`;
        bindParams.push(pagination.limit, pagination.offset);
      }

      const [result, chaptersBySlug] = await Promise.all([
        db.prepare(query).bind(...bindParams).all<RoutineRow>(),
        fetchChaptersForAllRoutines(db, locale),
      ]);

      const rows: RoutineRow[] = result.results ?? [];
      return rows.map((row: RoutineRow) =>
        mapRoutine(row, chaptersBySlug.get(row.slug) ?? []),
      );
    },

    async countRoutines(filters?: RoutineFilters) {
      const { whereClause, params } = buildRoutineWhereClause(filters);
      const row = await db
        .prepare(`SELECT COUNT(*) AS count FROM routines r${whereClause}`)
        .bind(...params)
        .first<{ count: number }>();
      return Number(row?.count ?? 0);
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

    async listExternalCourses(locale) {
      // Newer catalog entity than routines/instructors: `resolveCatalog()`
      // only probes the `routines` table to decide d1-vs-mock, so an
      // environment whose D1 hasn't had migration 0012 applied yet (remote
      // migrations are a manual `npm run db:migrate:remote` step, unlike
      // local dev's automatic `predev`/`prepreview` hooks) would otherwise
      // 500 here instead of just missing this one catalog slice. Fall back
      // to the mock list so the page still renders.
      try {
        const [result, lessonsBySlug] = await Promise.all([
          db
            .prepare(
              `SELECT
                 ec.slug, ec.provider, ec.price_display, ec.cover_image, ec.style,
                 eci.title, eci.tagline, eci.description,
                 si.label AS style_label
               FROM external_courses ec
               LEFT JOIN external_course_i18n eci ON eci.slug = ec.slug AND eci.locale = ?
               LEFT JOIN style_i18n si ON si.style_key = ec.style AND si.locale = ?
               ORDER BY ec.sort_order ASC`,
            )
            .bind(locale, locale)
            .all<ExternalCourseRow>(),
          fetchLessonsForAllExternalCourses(db, locale),
        ]);

        return ((result.results ?? []) as ExternalCourseRow[]).map(
          (row: ExternalCourseRow) =>
            mapExternalCourse(row, lessonsBySlug.get(row.slug) ?? []),
        );
      } catch (error) {
        console.error(
          "D1 external_courses query failed; falling back to the in-memory mock list:",
          error,
        );
        return mockCatalogRepository.listExternalCourses(locale);
      }
    },

    async getExternalCourse(locale, slug) {
      try {
        const [row, lessons] = await Promise.all([
          db
            .prepare(
              `SELECT
                 ec.slug, ec.provider, ec.price_display, ec.cover_image, ec.style,
                 eci.title, eci.tagline, eci.description,
                 si.label AS style_label
               FROM external_courses ec
               LEFT JOIN external_course_i18n eci ON eci.slug = ec.slug AND eci.locale = ?
               LEFT JOIN style_i18n si ON si.style_key = ec.style AND si.locale = ?
               WHERE ec.slug = ?`,
            )
            .bind(locale, locale, slug)
            .first<ExternalCourseRow>(),
          fetchLessonsForSlug(db, locale, slug),
        ]);

        if (!row) return null;
        return mapExternalCourse(row, lessons);
      } catch (error) {
        console.error(
          "D1 external_courses query failed; falling back to the in-memory mock lookup:",
          error,
        );
        return mockCatalogRepository.getExternalCourse(locale, slug);
      }
    },

    async getExternalCourseLessonSource(courseSlug, lessonId) {
      try {
        const row = await db
          .prepare(
            `SELECT r2_key FROM external_course_lessons
             WHERE course_slug = ? AND lesson_id = ?`,
          )
          .bind(courseSlug, lessonId)
          .first<{ r2_key: string }>();

        return row ? { r2Key: row.r2_key } : null;
      } catch (error) {
        console.error(
          "D1 external_course_lessons query failed; falling back to the in-memory mock lookup:",
          error,
        );
        return mockCatalogRepository.getExternalCourseLessonSource(
          courseSlug,
          lessonId,
        );
      }
    },
  };
}
