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
} from "@/lib/routines";
import type {
  CatalogRepository,
  RoutineFilters,
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
  };
}

export const mockCatalogRepository: CatalogRepository = {
  async listRoutines(locale, filters?: RoutineFilters) {
    return getAllRoutines()
      .filter((routine) => {
        if (filters?.instructor && routine.instructorSlug !== filters.instructor) {
          return false;
        }
        if (filters?.style && routine.style !== filters.style) return false;
        if (filters?.level && routine.level !== filters.level) return false;
        return true;
      })
      .map((routine) => toCatalogRoutine(locale, routine.slug))
      .filter((item): item is CatalogRoutine => item !== null);
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
};
