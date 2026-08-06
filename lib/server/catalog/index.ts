import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";
import type { CatalogRepository } from "@/lib/server/catalog/repository";

/**
 * Active catalog data source.
 * Swap this return value when D1/CMS is ready — callers stay the same.
 */
export function getCatalogRepository(): CatalogRepository {
  return mockCatalogRepository;
}

export function resolveCatalogLocale(
  value: string | null | undefined,
): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
