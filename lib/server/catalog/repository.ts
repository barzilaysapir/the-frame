import type { Locale } from "@/lib/i18n/config";
import type {
  CatalogExternalCourse,
  CatalogInstructor,
  CatalogRoutine,
} from "@/lib/server/catalog/types";

export interface RoutineFilters {
  instructor?: string;
  style?: string;
  level?: string;
}

export interface RoutinePagination {
  limit: number;
  offset: number;
}

export interface CatalogRepository {
  listRoutines(
    locale: Locale,
    filters?: RoutineFilters,
    pagination?: RoutinePagination,
  ): Promise<CatalogRoutine[]>;
  /** Count of routines matching `filters`, ignoring pagination — powers the library's infinite-scroll `hasMore`/result-count UI. */
  countRoutines(filters?: RoutineFilters): Promise<number>;
  getRoutine(locale: Locale, slug: string): Promise<CatalogRoutine | null>;
  listInstructors(locale: Locale): Promise<CatalogInstructor[]>;
  getInstructor(
    locale: Locale,
    slug: string,
  ): Promise<CatalogInstructor | null>;
  listExternalCourses(locale: Locale): Promise<CatalogExternalCourse[]>;
  getExternalCourse(
    locale: Locale,
    slug: string,
  ): Promise<CatalogExternalCourse | null>;
}
