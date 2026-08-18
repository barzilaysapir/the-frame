-- Favorites was routine-only (`routine_slug` FK'd to `routines(slug)`), so
-- external courses had nowhere to be favorited into — see issue #248, and
-- the same "built routine-only, external courses forgotten" shape as #227
-- (instructor filtering, fixed in 0030/0034 by adding a real instructor
-- link to external_courses).
--
-- Generalize to a polymorphic (item_type, item_slug) key instead of a
-- routine-only FK. SQLite can't express "FK to routines OR external_courses
-- depending on a column" declaratively, so this intentionally drops the FK
-- (and its ON DELETE CASCADE) on the content side — referential integrity
-- for item_slug is enforced at the application layer (the API looks up the
-- item before inserting, same as before). The firebase_uid -> users FK is
-- kept, since that side has no such ambiguity.
--
-- item_type is 'lesson' (not 'routine') deliberately — the label shouldn't
-- be coupled to today's table split. If an internally-hosted multi-lesson
-- course ever exists alongside today's external ones, it adds a third
-- value here (e.g. 'internal_course') rather than forcing a rename.
CREATE TABLE favorites_new (
  firebase_uid TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lesson', 'external_course')),
  item_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (firebase_uid, item_type, item_slug),
  FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

INSERT INTO favorites_new (firebase_uid, item_type, item_slug, created_at)
  SELECT firebase_uid, 'lesson', routine_slug, created_at FROM favorites;

DROP TABLE favorites;
ALTER TABLE favorites_new RENAME TO favorites;

CREATE INDEX favorites_item_idx ON favorites (item_type, item_slug);
