-- The demo/mock catalog (all seeded routines/instructors, plus 5 of the 6
-- seeded external courses — fake "example.com" affiliate listings, see
-- migrations/0012_external_courses.sql) never belonged in the database the
-- real product reads from. It's still fully available for testing via the
-- in-memory mockCatalogRepository (lib/routines.ts, lib/instructors.ts,
-- lib/external-courses.ts) — see lib/server/catalog/index.ts, which serves
-- that repository instead of D1 when the /api/preview cookie is set.
--
-- Deleting `routines`/`instructors` cascades to their i18n/chapters/favorites
-- rows (ON DELETE CASCADE); routines are deleted first so no instructor is
-- deleted while a routine still references it. `style_i18n`/`level_i18n`
-- are taxonomy labels, not catalog entities, and are left alone.
--
-- `purchases.routine_slug` has no cascade (migrations/0003), and every row
-- in it today (the demo purchases seeded by migrations/0008, tied to the
-- demo users from that same migration) necessarily points at one of these
-- demo routines — there are no real routines yet for a purchase to
-- reference. Clear it first so the routines delete doesn't hit the FK.
DELETE FROM purchases WHERE routine_slug IN (SELECT slug FROM routines);
DELETE FROM routines;
DELETE FROM instructors;
DELETE FROM external_courses WHERE slug != 'gisha-gmisha-foundations';
