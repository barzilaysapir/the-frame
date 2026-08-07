/**
 * In-memory catalog repository (same content as D1 seed).
 * Used only when the D1 binding is unavailable (e.g. plain `next dev`
 * without OpenNext/Wrangler). Prefer D1 in preview/production.
 */
import type { Locale } from "@/lib/i18n/config";
import {
  localizeInstructor,
  localizeRoutine,
} from "@/lib/i18n/localize";
import {
  getAllInstructors,
  getInstructorBySlug,
} from "@/lib/instructors";
import {
  getAllRoutines,
  getRoutineBySlug,
  getRoutinesByInstructor,
} from "@/lib/routines";
import type { CatalogRepository } from "@/lib/server/catalog/repository";
import type {
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

export const mockCatalogRepository: CatalogRepository = {
  async listRoutines(locale) {
    return getAllRoutines()
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
};
