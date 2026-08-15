-- Real course owner confirmed pricing/copy for gisha-gmisha-foundations,
-- replacing the placeholders seeded in migration 0017. Studio name folded
-- into the title; `provider` now credits the instructor (matches
-- lib/external-courses.ts + mocks/content/{en,he}.json). Tagline/description
-- deliberately left blank — not needed / to follow later.

UPDATE external_courses
  SET provider = 'יהל חייט', price_display = '₪200'
  WHERE slug = 'gisha-gmisha-foundations';

UPDATE external_course_i18n
  SET title = 'גישה גמישה - קורס יסודות', tagline = '', description = ''
  WHERE slug = 'gisha-gmisha-foundations' AND locale = 'he';

UPDATE external_course_i18n
  SET title = 'Gisha Gmisha - Foundations Course', tagline = '', description = ''
  WHERE slug = 'gisha-gmisha-foundations' AND locale = 'en';
