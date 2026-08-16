-- Instructors can teach more than one style (e.g. jazz AND flexibility/
-- technique) — the single NOT NULL `style` column can't represent that, so
-- it's replaced with a proper junction table. `instructors` is empty at
-- this point (see migrations/0027_remove_demo_catalog_seed.sql), so there's
-- no data to migrate.
ALTER TABLE instructors DROP COLUMN style;

CREATE TABLE instructor_styles (
  instructor_slug TEXT NOT NULL,
  style_key TEXT NOT NULL,
  -- Display order for this instructor's style badges/role line.
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (instructor_slug, style_key),
  FOREIGN KEY (instructor_slug) REFERENCES instructors(slug) ON DELETE CASCADE
);
