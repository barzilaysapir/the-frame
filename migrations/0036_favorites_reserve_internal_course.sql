-- Reserve a third favorites item_type for an internally-hosted, multi-lesson
-- course (as opposed to today's two: a single-video 'lesson' — a routine —
-- and a third-party 'external_course'). No such content type exists yet
-- (no table, no catalog method, no card), so nothing can actually produce
-- an 'internal_course' favorite today — this migration only widens the
-- CHECK constraint so that when the feature ships, it's a repository +
-- API + UI change, not another table rebuild.
--
-- SQLite has no `ALTER TABLE ... ALTER CHECK`, so this rebuilds the table
-- (same approach as 0034/0035).
CREATE TABLE favorites_new (
  firebase_uid TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lesson', 'internal_course', 'external_course')),
  item_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (firebase_uid, item_type, item_slug),
  FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

INSERT INTO favorites_new (firebase_uid, item_type, item_slug, created_at)
  SELECT firebase_uid, item_type, item_slug, created_at FROM favorites;

DROP TABLE favorites;
ALTER TABLE favorites_new RENAME TO favorites;

CREATE INDEX favorites_item_idx ON favorites (item_type, item_slug);
