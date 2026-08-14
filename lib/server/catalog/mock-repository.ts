/**
 * In-memory catalog repository — a last-resort fallback, kept byte-for-byte
 * in sync with the D1 seed content (verify with
 * `npm run verify:mock-db-parity`).
 *
 * Plain `next dev` normally does **not** hit this: `next.config.mjs` calls
 * `initOpenNextCloudflareForDev()`, which wires up wrangler's platform proxy
 * so `next dev` reads the same local D1 SQLite state as `npm run preview`
 * (`npm run predev` also applies any pending migrations first). This
 * in-memory repo only kicks in when no local D1 state exists at all yet
 * (fresh clone before the first `npm run db:migrate:local`) or a real D1
 * error occurs — see `resolveCatalog()`.
 */
import "server-only";
import type { Locale } from "@/lib/i18n/config";
import {
  localizeExternalCourse,
  localizeExternalCourseLessonTitle,
  localizeInstructor,
  localizeRoutine,
} from "@/lib/i18n/localize";
import {
  getAllExternalCourses,
  getExternalCourseBySlug,
} from "@/lib/external-courses";
import {
  getAllInstructors,
  getInstructorBySlug,
} from "@/lib/instructors";
import {
  getAllRoutines,
  getRoutineBySlug,
  getRoutinesByInstructor,
  type RoutineRecord,
} from "@/lib/routines";
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
} from "@/lib/server/catalog/types";

function toCatalogRoutine(
  locale: Locale,
  slug: string,
): CatalogRoutine | null {
  const routine = getRoutineBySlug(slug);
  if (!routine) return null;

  const localized = localizeRoutine(locale, routine);

  return {
    slug: routine.slug,
    title: routine.title,
    songName: routine.songName,
    artist: routine.artist,
    instructorSlug: routine.instructorSlug,
    level: routine.level,
    levelLabel: localized.level,
    style: routine.style,
    styleLabel: localized.style,
    tags: routine.tags,
    bpm: routine.bpm,
    length: routine.length,
    lengthLabel: localized.length,
    technique: localized.technique,
    description: localized.description,
    poster: routine.poster,
    videoSrc: routine.videoSrc,
    chapters: localized.chapters,
    pricing: routine.pricing,
  };
}

function toCatalogInstructor(
  locale: Locale,
  slug: string,
): CatalogInstructor | null {
  const instructor = getInstructorBySlug(slug);
  if (!instructor) return null;

  const localized = localizeInstructor(locale, instructor);

  return {
    slug: instructor.slug,
    name: localized.name,
    role: localized.role,
    bio: localized.bio,
    style: instructor.style,
    avatar: instructor.avatar,
    instagramUrl: instructor.instagramUrl,
    routineCount: getRoutinesByInstructor(instructor.slug).length,
  };
}

function toCatalogExternalCourse(
  locale: Locale,
  slug: string,
): CatalogExternalCourse | null {
  const course = getExternalCourseBySlug(slug);
  if (!course) return null;

  const localized = localizeExternalCourse(locale, course);

  return {
    slug: course.slug,
    title: localized.title,
    provider: course.provider,
    tagline: localized.tagline,
    description: localized.description,
    priceDisplay: course.priceDisplay,
    coverImage: course.coverImage,
    lessons: (course.lessons ?? []).map((lesson) => ({
      id: lesson.id,
      title: localizeExternalCourseLessonTitle(locale, course.slug, lesson.id),
    })),
  };
}

function filterRoutineRecords(
  records: RoutineRecord[],
  filters?: RoutineFilters,
): RoutineRecord[] {
  const instructors = splitFilterValues(filters?.instructor);
  const styles = splitFilterValues(filters?.style);
  const levels = splitFilterValues(filters?.level);

  return records.filter((routine) => {
    if (instructors.length > 0 && !instructors.includes(routine.instructorSlug)) return false;
    if (styles.length > 0 && !styles.includes(routine.style)) return false;
    if (levels.length > 0 && !levels.includes(routine.level)) return false;
    return true;
  });
}

export const mockCatalogRepository: CatalogRepository = {
  async listRoutines(
    locale,
    filters?: RoutineFilters,
    pagination?: RoutinePagination,
  ) {
    const filtered = filterRoutineRecords(getAllRoutines(), filters);
    const paged = pagination
      ? filtered.slice(pagination.offset, pagination.offset + pagination.limit)
      : filtered;

    return paged
      .map((routine) => toCatalogRoutine(locale, routine.slug))
      .filter((item): item is CatalogRoutine => item !== null);
  },

  async countRoutines(filters?: RoutineFilters) {
    return filterRoutineRecords(getAllRoutines(), filters).length;
  },

  async getRoutine(locale, slug) {
    return toCatalogRoutine(locale, slug);
  },

  async listInstructors(locale) {
    return getAllInstructors()
      .map((instructor) => toCatalogInstructor(locale, instructor.slug))
      .filter((item): item is CatalogInstructor => item !== null);
  },

  async getInstructor(locale, slug) {
    return toCatalogInstructor(locale, slug);
  },

  async listExternalCourses(locale) {
    return getAllExternalCourses()
      .map((course) => toCatalogExternalCourse(locale, course.slug))
      .filter((item): item is CatalogExternalCourse => item !== null);
  },

  async getExternalCourse(locale, slug) {
    return toCatalogExternalCourse(locale, slug);
  },

  async getExternalCourseLessonSource(courseSlug, lessonId) {
    const course = getExternalCourseBySlug(courseSlug);
    const lesson = course?.lessons?.find((item) => item.id === lessonId);
    return lesson ? { r2Key: lesson.r2Key } : null;
  },
};
