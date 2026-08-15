import type { CatalogExternalCourse, CatalogRoutine } from "@/lib/server/catalog/types";

/** A single card in the unified library grid — either a routine or an external course. */
export type LibraryItem =
  | { kind: "routine"; routine: CatalogRoutine }
  | { kind: "external"; course: CatalogExternalCourse };
