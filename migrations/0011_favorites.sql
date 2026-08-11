-- Favorites: lets a signed-in user save routines for quick access later.
-- Numbered 0011 (not 0010) to avoid colliding with the in-flight
-- Commercial -> Voguing rename migration on another branch.

CREATE TABLE favorites (
  firebase_uid TEXT NOT NULL,
  routine_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (firebase_uid, routine_slug),
  FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (routine_slug) REFERENCES routines(slug) ON DELETE CASCADE
);

CREATE INDEX favorites_routine_slug_idx
  ON favorites (routine_slug);
