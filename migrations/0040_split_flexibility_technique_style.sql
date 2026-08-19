-- Split the combined "flexibility-technique" style into two distinct
-- styles. gisha-gmisha-foundations (warmup/neck/shoulder-blade/spine
-- mobility work) is flexibility content, so it and its instructor move to
-- 'flexibility'; 'technique' is added as a new, currently empty style.
-- Never edit already-applied style_i18n seeds — append here.

INSERT INTO style_i18n (style_key, locale, label) VALUES
  ('flexibility', 'he', 'גמישות'),
  ('flexibility', 'en', 'Flexibility'),
  ('technique', 'he', 'טכניקה'),
  ('technique', 'en', 'Technique');

UPDATE external_courses
SET style = 'flexibility'
WHERE style = 'flexibility-technique';

UPDATE instructor_styles
SET style_key = 'flexibility'
WHERE style_key = 'flexibility-technique';

DELETE FROM style_i18n WHERE style_key = 'flexibility-technique';
