-- Purchases was routine-only (`routine_slug` FK'd to `routines(slug)`), so
-- there was no way to record a real purchase of an external course — see
-- the launch-readiness guide's audit. Same shape as #248 (favorites, fixed
-- in 0035/0036): generalize to a polymorphic (item_type, item_slug) key
-- using the shared `CatalogItemType` vocabulary instead of a routine-only FK.
--
-- Unlike favorites, this table carries real payment fields (provider,
-- provider_payment_id, amount_ils, currency, status, paid_at) that must
-- survive the rebuild, and may already hold real (non-demo) rows by the
-- time this runs in production. Follow the backup-table idiom from 0034:
-- copy into a constraint-free backup table first, then drop/recreate/
-- restore, so nothing is ever dropped while something still legitimately
-- references it with live data at stake.
--
-- As with 0035, SQLite can't express "FK to routines OR external_courses
-- depending on a column" declaratively, so the FK to routines(slug) is
-- intentionally dropped — item_slug referential integrity is enforced at
-- the application layer (the API looks up the item before inserting).
-- The firebase_uid -> users FK is kept, since that side has no such
-- ambiguity.

CREATE TABLE purchases_backup AS SELECT * FROM purchases;

DROP TABLE purchases;

CREATE TABLE purchases (
  id TEXT PRIMARY KEY NOT NULL,
  firebase_uid TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lesson', 'internal_course', 'external_course')),
  item_slug TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_payment_id TEXT,
  amount_ils INTEGER,
  currency TEXT NOT NULL DEFAULT 'ILS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

INSERT INTO purchases
  (id, firebase_uid, item_type, item_slug, provider, provider_payment_id, amount_ils, currency, status, created_at, paid_at)
  SELECT id, firebase_uid, 'lesson', routine_slug, provider, provider_payment_id, amount_ils, currency, status, created_at, paid_at
  FROM purchases_backup;

DROP TABLE purchases_backup;

CREATE INDEX purchases_uid_status_idx ON purchases (firebase_uid, status);
CREATE INDEX purchases_item_idx ON purchases (item_type, item_slug);

CREATE UNIQUE INDEX purchases_paid_unique
  ON purchases (firebase_uid, item_type, item_slug)
  WHERE status = 'paid';
