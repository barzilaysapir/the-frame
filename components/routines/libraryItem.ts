import type {
  CatalogExternalCourse,
  CatalogItemType,
  CatalogRoutine,
} from "@/lib/server/catalog/types";

/** A single card in the unified library grid — either a routine or an external course. */
export type LibraryItem =
  | { kind: Extract<CatalogItemType, "lesson">; routine: CatalogRoutine }
  | { kind: Extract<CatalogItemType, "external_course">; course: CatalogExternalCourse };
