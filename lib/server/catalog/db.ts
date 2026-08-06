import { getCloudflareContext } from "@opennextjs/cloudflare";

export type CatalogDb = CloudflareEnv["CATALOG_DB"];

/**
 * Resolve the D1 catalog binding when running under Cloudflare / OpenNext.
 * Returns null outside Workers (or when the binding is missing) so callers
 * can fall back to the mock repository.
 */
export async function getCatalogDb(): Promise<CatalogDb | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.CATALOG_DB ?? null;
  } catch {
    return null;
  }
}
