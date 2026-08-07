import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getAppDb } from "@/lib/server/db";
import { createD1CatalogRepository } from "@/lib/server/catalog/d1-repository";
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";
import type { CatalogRepository } from "@/lib/server/catalog/repository";
import type { CatalogSource } from "@/lib/server/catalog/types";

export interface ResolvedCatalog {
  repository: CatalogRepository;
  source: CatalogSource;
}

/**
 * Prefer Cloudflare D1 (already seeded with the demo/mock catalog).
 * Fall back to the in-memory mock repo when the D1 binding is missing
 * (typical for plain `next dev` without Wrangler).
 */
export async function resolveCatalog(): Promise<ResolvedCatalog> {
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
    return {
      repository: createD1CatalogRepository(db),
      source: "d1",
    };
  } catch {
    return { repository: mockCatalogRepository, source: "mock" };
  }
}

export function resolveCatalogLocale(
  value: string | null | undefined,
): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
