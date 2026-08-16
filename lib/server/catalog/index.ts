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
  const db = await getAppDb();
  if (!db) {
    return { repository: mockCatalogRepository, source: "mock" };
  }

  try {
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM routines")
      .first<{ count: number }>();
    if (!row || Number(row.count) < 1) {
      return { repository: mockCatalogRepository, source: "mock" };
    }
    const cookieStore = await cookies();
    const includeDemo = cookieStore.get(PREVIEW_CATALOG_COOKIE)?.value === "1";
    return {
      repository: createD1CatalogRepository(db, { includeDemo }),
      source: "d1",
    };
  } catch (error) {
    console.error(
      "D1 catalog query failed; falling back to the in-memory mock catalog:",
      error,
    );
    return { repository: mockCatalogRepository, source: "mock" };
  }
}

/**
 * Prefer Cloudflare D1 (already seeded with the demo/mock catalog).
 * Fall back to the in-memory mock repo when the D1 binding is missing or
 * unseeded. In practice this rarely happens under plain `next dev` — see
 * `mock-repository.ts` for why — but it's the safety net for a fresh clone
 * that hasn't run `npm run db:migrate:local` yet, or a CI build with no
 * local D1 state.
 *
 * Rows flagged `is_demo` — every seeded routine/instructor, plus 5 of the 6
 * seeded external courses (only `gisha-gmisha-foundations` is real) — are
 * hidden by default; visiting `/api/preview?token=...` sets the cookie in
 * `lib/preview.ts` that unlocks them for that browser. See
 * `app/api/preview/route.ts`.
 *
 * Memoized per request (React `cache`) — `generateMetadata` and the page
 * component both call this, and without memoization each would resolve the
 * D1 binding and re-run the `SELECT COUNT(*)` probe independently.
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
