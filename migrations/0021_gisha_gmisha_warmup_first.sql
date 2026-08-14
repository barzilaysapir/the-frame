-- Restore warmup as the first Gisha Gmisha foundations lesson (the R2
-- object exists). Reorder the four lessons seeded in 0020 after it.
-- Matches lib/external-courses.ts + mocks/content/{en,he}.json.

INSERT OR IGNORE INTO external_course_lessons (course_slug, lesson_id, r2_key, sort_order) VALUES
  ('gisha-gmisha-foundations', 'warmup', 'external-courses/gisha-gmisha/foundations/warmup.mp4', 0);

INSERT OR IGNORE INTO external_course_lesson_i18n (course_slug, lesson_id, locale, title) VALUES
  ('gisha-gmisha-foundations', 'warmup', 'he', 'חימום'),
  ('gisha-gmisha-foundations', 'warmup', 'en', 'Warm-up');

UPDATE external_course_lessons SET sort_order = 0
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'warmup';
UPDATE external_course_lessons SET sort_order = 1
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'head-neck';
UPDATE external_course_lessons SET sort_order = 2
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'shoulder-blades';
UPDATE external_course_lessons SET sort_order = 3
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'shoulder-blades-physio-exercise';
UPDATE external_course_lessons SET sort_order = 4
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'spine-abs';
