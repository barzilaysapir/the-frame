-- The "zzz-internal-test-payment" external course (₪1, used to end-to-end
-- test the real Grow/uPay webhook) and its paid purchase were created
-- directly against the remote D1 database, not through a migration — so
-- they never reached local D1. Seed them here (idempotently, since remote
-- already has both) so the "internal test — do not purchase" card shows up
-- in the library locally too.

INSERT OR IGNORE INTO external_courses
  (slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug)
VALUES
  ('zzz-internal-test-payment', 'Internal', '₪1', 999, '', 'flexibility-technique', 'beginner', NULL);

INSERT OR IGNORE INTO external_course_i18n (slug, locale, title, tagline, description, provider) VALUES
  ('zzz-internal-test-payment', 'en', 'Internal test — do not purchase', 'Payment system test', '', 'Internal'),
  ('zzz-internal-test-payment', 'he', 'בדיקה פנימית — לא לרכישה', 'בדיקת מערכת תשלומים', '', 'Internal');

INSERT INTO purchases (id, firebase_uid, item_type, item_slug, provider, amount_ils, currency, status, created_at, paid_at)
SELECT 'seed-zzz-internal-test-payment', 'nhuLzs71A9Zd7hAy8O4KgPNAhqR2', 'external_course', 'zzz-internal-test-payment', 'bit', 1, 'ILS', 'paid', datetime('now'), datetime('now')
WHERE NOT EXISTS (
  SELECT 1 FROM purchases
  WHERE firebase_uid = 'nhuLzs71A9Zd7hAy8O4KgPNAhqR2'
    AND item_type = 'external_course'
    AND item_slug = 'zzz-internal-test-payment'
);
