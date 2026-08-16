-- First real instructor in the catalog — teaches the existing real course
-- (gisha-gmisha-foundations, see migrations/0019) plus modern jazz.
-- Bio left blank (not fabricated) until real copy is supplied.
INSERT INTO instructors (slug, avatar, instagram_url) VALUES
  ('yahel-hayat', '/instructors/yahel-hayat.jpg', 'https://www.instagram.com/yahel_hayat/');

INSERT INTO instructor_i18n (slug, locale, name, bio) VALUES
  ('yahel-hayat', 'he', 'יהל חייט', ''),
  ('yahel-hayat', 'en', 'Yahel Hayat', '');

INSERT INTO instructor_styles (instructor_slug, style_key, sort_order) VALUES
  ('yahel-hayat', 'jazz', 0),
  ('yahel-hayat', 'flexibility-technique', 1);
