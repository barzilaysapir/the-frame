-- Marks the seeded routines/instructors catalog as demo content, distinct
-- from real external courses (which are always real, no flag needed).
-- Existing rows default to 1 (demo) since every routine/instructor seeded
-- so far is placeholder content — see migrations/0002_catalog_seed.sql.
-- Production hides is_demo rows by default (see lib/server/catalog/index.ts);
-- the /api/preview link flips a cookie to show them for testing.
ALTER TABLE routines ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 1;
ALTER TABLE instructors ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 1;
