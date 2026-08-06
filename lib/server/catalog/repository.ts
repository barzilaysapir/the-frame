import type { Locale } from "@/lib/i18n/config";
import type {
  CatalogInstructor,
  CatalogRoutine,
} from "@/lib/server/catalog/types";

export interface CatalogRepository {
  listRoutines(locale: Locale): Promise<CatalogRoutine[]>;
  getRoutine(locale: Locale, slug: string): Promise<CatalogRoutine | null>;
  listInstructors(locale: Locale): Promise<CatalogInstructor[]>;
  getInstructor(
    locale: Locale,
    slug: string,
  ): Promise<CatalogInstructor | null>;
}
