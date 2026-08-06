import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getCatalogDb } from "@/lib/server/catalog/db";
import { createD1CatalogRepository } from "@/lib/server/catalog/d1-repository";
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";
import type { CatalogRepository } from "@/lib/server/catalog/repository";
import type { CatalogSource } from "@/lib/server/catalog/types";

export interface ResolvedCatalog {
  repository: CatalogRepository;
  source: CatalogSource;
}

/**
 * Prefer D1 when the binding is available and seeded; otherwise mock data.
 * Callers (API routes / server code) should use this instead of importing mocks.
 */
export async function resolveCatalog(): Promise<ResolvedCatalog> {
  const db = await getCatalogDb();
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

/** @deprecated Prefer resolveCatalog() so the active source is known. */
export async function getCatalogRepository(): Promise<CatalogRepository> {
  const resolved = await resolveCatalog();
  return resolved.repository;
}

export function resolveCatalogLocale(
  value: string | null | undefined,
): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
