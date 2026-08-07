import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AppDb = CloudflareEnv["DB"];

/**
 * Resolve the shared app D1 binding (catalog + users + purchases).
 * Returns null outside Workers (or when the binding is missing).
 */
export async function getAppDb(): Promise<AppDb | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.DB ?? null;
  } catch {
    return null;
  }
}
