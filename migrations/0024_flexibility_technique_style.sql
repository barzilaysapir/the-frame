-- New library style for technique/flexibility courses (Gisha Gmisha).
-- Never edit already-applied style_i18n seeds — append here.

INSERT INTO style_i18n (style_key, locale, label) VALUES
  ('flexibility-technique', 'he', 'גמישות וטכניקה'),
  ('flexibility-technique', 'en', 'Flexibility and technique');

ALTER TABLE external_courses ADD COLUMN style TEXT;

UPDATE external_courses
SET style = 'flexibility-technique'
WHERE slug = 'gisha-gmisha-foundations';
