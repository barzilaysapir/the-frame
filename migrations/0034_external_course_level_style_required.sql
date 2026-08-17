-- external_courses.level/style were left nullable when introduced
-- (migrations 0024, 0025) because mock "coming soon" demo listings never
-- set them. Those mock listings are gone now (see lib/external-courses.ts)
-- and every remaining course is real, so there's no meaningful difference
-- between an external course and a routine (migrations/0001, where
-- routines.level/style are NOT NULL) — enforce the same constraint here.
--
-- SQLite has no `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL`, so this
-- rebuilds the table. `external_course_i18n`/`external_course_lessons`/
-- `external_course_lesson_i18n` all have `ON DELETE CASCADE` foreign keys
-- pointing at `external_courses` — dropping it would wipe them. D1 does not
-- reliably honor `PRAGMA foreign_keys=OFF` to suppress that across a
-- migration's statements (confirmed the hard way: an earlier version of
-- this migration silently cascade-deleted every course title/lesson).
-- So instead of dropping the FK parent, back up every dependent table's
-- rows into plain (constraint-free) tables first, drop the whole small
-- table graph together, recreate it with the new constraint, then restore
-- from the backups — no cascade can fire because nothing is dropped while
-- anything still legitimately references it with live data at stake.

CREATE TABLE external_courses_backup AS SELECT * FROM external_courses;
CREATE TABLE external_course_i18n_backup AS SELECT * FROM external_course_i18n;
CREATE TABLE external_course_lessons_backup AS SELECT * FROM external_course_lessons;
CREATE TABLE external_course_lesson_i18n_backup AS SELECT * FROM external_course_lesson_i18n;

DROP TABLE external_course_lesson_i18n;
DROP TABLE external_course_lessons;
DROP TABLE external_course_i18n;
DROP TABLE external_courses;

CREATE TABLE external_courses (
  slug TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  price_display TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT NOT NULL DEFAULT '',
  style TEXT NOT NULL,
  level TEXT NOT NULL,
  instructor_slug TEXT REFERENCES instructors(slug)
);

CREATE TABLE external_course_i18n (
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (slug, locale),
  FOREIGN KEY (slug) REFERENCES external_courses(slug) ON DELETE CASCADE
);

CREATE INDEX external_course_i18n_locale_idx
  ON external_course_i18n (locale);

CREATE TABLE external_course_lessons (
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  allow_mirror INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (course_slug, lesson_id),
  FOREIGN KEY (course_slug) REFERENCES external_courses(slug) ON DELETE CASCADE
);

CREATE INDEX external_course_lessons_course_idx
  ON external_course_lessons (course_slug);

CREATE TABLE external_course_lesson_i18n (
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  PRIMARY KEY (course_slug, lesson_id, locale),
  FOREIGN KEY (course_slug, lesson_id)
    REFERENCES external_course_lessons(course_slug, lesson_id) ON DELETE CASCADE
);

INSERT INTO external_courses
  (slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug)
  SELECT slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug
  FROM external_courses_backup;

INSERT INTO external_course_i18n (slug, locale, title, tagline, description, provider)
  SELECT slug, locale, title, tagline, description, provider FROM external_course_i18n_backup;

INSERT INTO external_course_lessons (course_slug, lesson_id, r2_key, sort_order, allow_mirror)
  SELECT course_slug, lesson_id, r2_key, sort_order, allow_mirror FROM external_course_lessons_backup;

INSERT INTO external_course_lesson_i18n (course_slug, lesson_id, locale, title)
  SELECT course_slug, lesson_id, locale, title FROM external_course_lesson_i18n_backup;

DROP TABLE external_courses_backup;
DROP TABLE external_course_i18n_backup;
DROP TABLE external_course_lessons_backup;
DROP TABLE external_course_lesson_i18n_backup;
