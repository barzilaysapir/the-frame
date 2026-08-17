-- Second real instructor + their course, same pattern as Yahel Hayat /
-- gisha-gmisha-foundations (migrations 0029, 0030, 0017). Avatar is a
-- temporary crop of her Instagram profile photo (@daniellani18); price is a
-- placeholder — both to be replaced by follow-up migrations once real
-- assets/copy are provided.

INSERT INTO instructors (slug, avatar, instagram_url) VALUES
  ('daniel-lani', '/instructors/daniel-lani.jpg', 'https://www.instagram.com/daniellani18/');

INSERT INTO instructor_i18n (slug, locale, name, bio) VALUES
  ('daniel-lani', 'he', 'דניאל לאני', ''),
  ('daniel-lani', 'en', 'Daniel Lani', '');

INSERT INTO instructor_styles (instructor_slug, style_key, sort_order) VALUES
  ('daniel-lani', 'heels', 0);

INSERT INTO external_courses (slug, provider, price_display, sort_order, cover_image, style, level, instructor_slug) VALUES
  ('vibe-on-heels', 'דניאל לאני', 'בקרוב', 7, '/routine-posters/routine-poster-velvet-heels.png', 'heels', 'all-levels', 'daniel-lani');

INSERT INTO external_course_i18n (slug, locale, title, tagline, description, provider) VALUES
  ('vibe-on-heels', 'he', 'Vibe on Heels', '', '', 'דניאל לאני'),
  ('vibe-on-heels', 'en', 'Vibe on Heels', '', '', 'Daniel Lani');
