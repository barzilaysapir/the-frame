/**
 * Cookie that unlocks the demo catalog (mock routines/instructors) outside
 * of local dev. Set by `/api/preview` after a matching `PREVIEW_CATALOG_TOKEN`
 * — see lib/server/catalog/index.ts for where it's read.
 */
export const PREVIEW_CATALOG_COOKIE = "preview_catalog";
