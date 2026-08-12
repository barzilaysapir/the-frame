import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ApiError } from "@/lib/server/api/auth-context";

/**
 * Guards the /me* write endpoints against a single account hammering
 * profile/favorites writes. Cloudflare's Rate Limiting binding is per-PoP and
 * eventually consistent by design (not an accounting system) — that's fine
 * for abuse mitigation, which is all this is for.
 *
 * Fails open (does nothing) when the binding isn't available — e.g. plain
 * `next dev` without `wrangler dev`-backed bindings, or a fresh environment
 * that hasn't been redeployed with the new binding yet — so a missing
 * binding degrades to "no rate limiting" rather than a hard 503 on every
 * write.
 */
export async function enforceWriteRateLimit(key: string): Promise<void> {
  let limiter;
  try {
    const { env } = await getCloudflareContext({ async: true });
    limiter = env.ME_WRITE_RATE_LIMITER;
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for rate limiting:", error);
    return;
  }
  if (!limiter) return;

  const { success } = await limiter.limit({ key });
  if (!success) {
    throw new ApiError(429, "Too many requests — please slow down");
  }
}
