-- Localized instructor/provider name for external courses (Hebrew stays
-- on `external_courses.provider`; English copy lives in i18n).

ALTER TABLE external_course_i18n ADD COLUMN provider TEXT NOT NULL DEFAULT '';

UPDATE external_course_i18n
  SET provider = (
    SELECT provider FROM external_courses WHERE slug = external_course_i18n.slug
  )
  WHERE provider = '';

UPDATE external_course_i18n
  SET provider = 'יהל חייט'
  WHERE slug = 'gisha-gmisha-foundations' AND locale = 'he';

UPDATE external_course_i18n
  SET provider = 'Yahel Hayat'
  WHERE slug = 'gisha-gmisha-foundations' AND locale = 'en';
