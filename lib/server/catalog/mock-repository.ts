/**
 * In-memory catalog repository — the canonical source for the demo/mock
 * catalog. D1 no longer seeds this content (see
 * migrations/0027_remove_demo_catalog_seed.sql); this is the only place it
 * lives. `resolveCatalog()` serves it in two cases:
 *
 * - The `/api/preview` cookie is set (see `lib/preview.ts`) — the intended,
 *   everyday way to see the demo catalog for testing.
 * - D1 itself is unavailable (fresh clone before the first
 *   `npm run db:migrate:local`, or a CI build with no local D1 state) — a
 *   last-resort fallback so the app still renders *something*.
 */
import "server-only";
import type { Locale } from "@/lib/i18n/config";
import {
  localizeExternalCourse,
  localizeExternalCourseLessonTitle,
  localizeInstructor,
  localizeLevel,
  localizeRoutine,
  localizeStyle,
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
    styles: [instructor.style],
    avatar: instructor.avatar,
    instagramUrl: instructor.instagramUrl,
    routineCount: getRoutinesByInstructor(instructor.slug).length,
    courseCount: getAllExternalCourses().filter(
      (course) => course.instructorSlug === instructor.slug,
    ).length,
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
    provider: localized.provider,
    instructorSlug: course.instructorSlug ?? null,
    tagline: localized.tagline,
    description: localized.description,
    curriculumTopics: localized.curriculumTopics,
    features: localized.features,
    priceDisplay: course.priceDisplay,
    coverImage: course.coverImage,
    promoVideo: course.promoVideo ?? null,
    promoPoster: course.promoPoster ?? null,
    style: course.style,
    styleLabel: localizeStyle(locale, course.style),
    level: course.level,
    levelLabel: localizeLevel(locale, course.level),
    lessons: (course.lessons ?? []).map((lesson) => ({
      id: lesson.id,
      title: localizeExternalCourseLessonTitle(locale, course.slug, lesson.id),
      allowMirror: lesson.allowMirror !== false,
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

  async getRoutineVideoSource(slug) {
    const routine = getRoutineBySlug(slug);
    return routine ? { videoSrc: routine.videoSrc } : null;
  },
};
