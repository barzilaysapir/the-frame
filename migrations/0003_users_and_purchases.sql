-- App domains beyond catalog: users (profile cache) + purchases (library entitlements).
-- Identity remains Firebase Auth; D1 stores app data keyed by firebase_uid.

CREATE TABLE users (
  firebase_uid TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  locale_pref TEXT NOT NULL DEFAULT 'he',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY NOT NULL,
  firebase_uid TEXT NOT NULL,
  routine_slug TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_payment_id TEXT,
  amount_ils INTEGER,
  currency TEXT NOT NULL DEFAULT 'ILS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (routine_slug) REFERENCES routines(slug)
);

CREATE INDEX purchases_uid_status_idx ON purchases (firebase_uid, status);

CREATE UNIQUE INDEX purchases_paid_unique
  ON purchases (firebase_uid, routine_slug)
  WHERE status = 'paid';
