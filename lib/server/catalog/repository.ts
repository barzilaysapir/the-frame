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

export interface CatalogRepository {
  listRoutines(
    locale: Locale,
    filters?: RoutineFilters,
  ): Promise<CatalogRoutine[]>;
  getRoutine(locale: Locale, slug: string): Promise<CatalogRoutine | null>;
  listInstructors(locale: Locale): Promise<CatalogInstructor[]>;
  getInstructor(
    locale: Locale,
    slug: string,
  ): Promise<CatalogInstructor | null>;
  listExternalCourses(locale: Locale): Promise<CatalogExternalCourse[]>;
}
