import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// R2 is not enabled on this Cloudflare account (`wrangler r2 bucket create`
// fails with "Please enable R2 through the Cloudflare Dashboard"), so the
// ISR/data-cache incremental cache uses Workers KV instead. Nothing in the
// app calls revalidateTag/revalidatePath, so no D1 tag cache is configured —
// this is pure time-based revalidation. See https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({
	incrementalCache: kvIncrementalCache,
	queue: doQueue,
});
