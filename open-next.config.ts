import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// R2 is not enabled on this Cloudflare account (`wrangler r2 bucket create`
// fails with "Please enable R2 through the Cloudflare Dashboard"), so the
// ISR/data-cache incremental cache uses Workers KV instead. Nothing in the
// app calls revalidateTag/revalidatePath, so no D1 tag cache is configured —
// this is pure time-based revalidation. See https://opennext.js.org/cloudflare/caching
//
// No `queue` override: the Durable Object queue (`overrides/queue/do-queue`)
// made the Cloudflare Workers Builds CI deploy step fail consistently
// (reproduced locally too — a clean `npx opennextjs-cloudflare build` +
// `wrangler deploy --dry-run` resolved the DO binding fine, so this looks
// like a live-provisioning issue, not a config error). Without it, OpenNext
// falls back to a no-op queue: stale-while-revalidate's background trigger
// becomes a no-op, so a KV entry past its `revalidate` window regenerates
// synchronously on the next request instead of proactively in the
// background — an acceptable tradeoff to unblock KV caching now. Revisit
// the DO queue once the Workers Builds failure is diagnosed.
export default defineCloudflareConfig({
	incrementalCache: kvIncrementalCache,
});
