import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { PREVIEW_CATALOG_COOKIE } from "@/lib/preview";
import { getAppDb } from "@/lib/server/db";
import { createD1CatalogRepository } from "@/lib/server/catalog/d1-repository";
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";
import type { CatalogRepository } from "@/lib/server/catalog/repository";
import type {
  CatalogExternalCourse,
  CatalogInstructor,
  CatalogRoutine,
  CatalogSource,
} from "@/lib/server/catalog/types";

export interface ResolvedCatalog {
  repository: CatalogRepository;
  source: CatalogSource;
}

async function resolveCatalogUncached(): Promise<ResolvedCatalog> {
  const cookieStore = await cookies();
  if (cookieStore.get(PREVIEW_CATALOG_COOKIE)?.value === "1") {
    return { repository: mockCatalogRepository, source: "mock" };
  }

  const db = await getAppDb();
  if (!db) {
    return { repository: mockCatalogRepository, source: "mock" };
  }

  try {
    // Just a schema probe, not a demo/real decision: an empty `routines`
    // table is a legitimate real-world state (see migrations/0027), so
    // unlike the old row-count check, this only rejects D1 when the table
    // doesn't exist yet at all.
    await db.prepare("SELECT 1 FROM routines LIMIT 1").first();
    return { repository: createD1CatalogRepository(db), source: "d1" };
  } catch (error) {
    console.error(
      "D1 catalog query failed; falling back to the in-memory mock catalog:",
      error,
    );
    return { repository: mockCatalogRepository, source: "mock" };
  }
}

/**
 * The demo/mock catalog (every seeded routine/instructor, plus 5 of the 6
 * seeded external courses — only `gisha-gmisha-foundations` is real; see
 * migrations/0027_remove_demo_catalog_seed.sql) isn't in D1 at all — D1
 * holds only real catalog rows. Visiting `/api/preview?token=...` sets the
 * cookie in `lib/preview.ts` that switches the *entire* repository to the
 * in-memory `mockCatalogRepository` for that browser, so callers never
 * filter demo content out of a query themselves — see
 * `app/api/preview/route.ts`.
 *
 * Outside of preview mode: prefer Cloudflare D1. Fall back to the in-memory
 * mock repo when the D1 binding is missing or unseeded. In practice this
 * rarely happens under plain `next dev` — see `mock-repository.ts` for why —
 * but it's the safety net for a fresh clone that hasn't run
 * `npm run db:migrate:local` yet, or a CI build with no local D1 state.
 *
 * Memoized per request (React `cache`) — `generateMetadata` and the page
 * component both call this, and without memoization each would resolve the
 * D1 binding and re-run the schema probe independently.
 */
export const resolveCatalog = cache(resolveCatalogUncached);

/**
 * Single-routine lookup memoized per request+args, so `generateMetadata`
 * and the page body sharing the same slug reuse one D1 round trip instead
 * of two.
 */
export const getCachedRoutine = cache(
  async (locale: Locale, slug: string): Promise<CatalogRoutine | null> => {
    const { repository } = await resolveCatalog();
    return repository.getRoutine(locale, slug);
  },
);

/** Single-instructor lookup, memoized the same way as `getCachedRoutine`. */
export const getCachedInstructor = cache(
  async (locale: Locale, slug: string): Promise<CatalogInstructor | null> => {
    const { repository } = await resolveCatalog();
    return repository.getInstructor(locale, slug);
  },
);

/** Single external-course lookup, memoized the same way as `getCachedRoutine`. */
export const getCachedExternalCourse = cache(
  async (
    locale: Locale,
    slug: string,
  ): Promise<CatalogExternalCourse | null> => {
    const { repository } = await resolveCatalog();
    return repository.getExternalCourse(locale, slug);
  },
);

export function resolveCatalogLocale(
  value: string | null | undefined,
): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
