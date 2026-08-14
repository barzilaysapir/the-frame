-- Adds "beginner" as a real, selectable level (content decision, not a
-- schema change — routines.level has no CHECK constraint). No existing
-- routine is reassigned to it; that's a separate content decision.
-- Also relabels "all-levels" to match the site's actual wording for it.

INSERT INTO level_i18n (level_key, locale, label) VALUES
  ('beginner', 'he', 'מתחילים'),
  ('beginner', 'en', 'Beginner');

UPDATE level_i18n SET label = 'רמה פתוחה' WHERE level_key = 'all-levels' AND locale = 'he';
UPDATE level_i18n SET label = 'Open level' WHERE level_key = 'all-levels' AND locale = 'en';
