-- external_courses.level/style were left nullable when introduced
-- (migrations 0024, 0025) because mock "coming soon" demo listings never
-- set them. Those mock listings are gone now (see lib/external-courses.ts)
-- and every remaining course is real, so there's no meaningful difference
-- between an external course and a routine (migrations/0001, where
-- routines.level/style are NOT NULL) — enforce the same constraint here.
--
-- SQLite has no `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL`, so rebuild
-- the table following SQLite's documented 12-step procedure. Both current
-- rows (gisha-gmisha-foundations, vibe-on-heels) already have style+level
-- set, so this is a pure constraint tightening, not a data migration.
PRAGMA foreign_keys=OFF;

CREATE TABLE external_courses_new (
  slug TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  price_display TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT NOT NULL DEFAULT '',
  style TEXT NOT NULL,
  level TEXT NOT NULL,
  instructor_slug TEXT REFERENCES instructors(slug)
);

INSERT INTO external_courses_new
  (slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug)
  SELECT slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug
  FROM external_courses;

DROP TABLE external_courses;
ALTER TABLE external_courses_new RENAME TO external_courses;

PRAGMA foreign_keys=ON;
