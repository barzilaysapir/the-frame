-- Heading above the curriculum chips: ten short lessons in heels basics.

ALTER TABLE external_course_i18n
  ADD COLUMN curriculum_heading TEXT NOT NULL DEFAULT '';

UPDATE external_course_i18n
  SET curriculum_heading = 'עשרה שיעורים קצרים בבסיס לריקוד על עקבים'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET curriculum_heading = 'Ten short lessons in the fundamentals of dancing in heels'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
