-- Replaces the long-sentence highlights bullets with two more scannable,
-- visual pieces: short curriculum topic chips, and icon+label feature
-- callouts (no experience needed, no floor work, etc.) rendered as a small
-- tile grid. Renames highlights_json (added in migration 0037, only ever
-- populated for vibe-on-heels) to curriculum_topics_json now that its
-- content is short topic labels rather than full sentences, and adds
-- features_json alongside it — same JSON-in-TEXT pattern as
-- routines.tags_json.

ALTER TABLE external_course_i18n
  RENAME COLUMN highlights_json TO curriculum_topics_json;

ALTER TABLE external_course_i18n
  ADD COLUMN features_json TEXT NOT NULL DEFAULT '[]';

UPDATE external_course_i18n
  SET
    curriculum_topics_json = '["מושגי יסוד","עמידות","הליכות","שיווי משקל","פאסה","וויבים","וויפים","Lay Out","שמיניות","קומבינציה מסכמת"]',
    features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא צריך נעל עקב ספציפית"},{"icon":"home","label":"מהבית, בלי עבודת רצפה"},{"icon":"infinity","label":"גישה ללא הגבלת זמן"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET
    curriculum_topics_json = '["Core concepts","Stance","Walks","Balance","Passe","Vibes","Whips","Lay Out","Figure eights","Final combo"]',
    features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel required"},{"icon":"home","label":"From home, no floor work"},{"icon":"infinity","label":"Unlimited-time access"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
