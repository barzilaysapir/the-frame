-- The R2 object is already uploaded; wire it as the last Gisha Gmisha
-- foundations lesson. Footage is already mirrored, same as the rest of
-- this course (see 0023).
-- Matches lib/external-courses.ts + mocks/content/{en,he}.json.

INSERT INTO external_course_lessons (course_slug, lesson_id, r2_key, sort_order, allow_mirror) VALUES
  ('gisha-gmisha-foundations', 'summary', 'class-videos/external-courses/gisha-gmisha/foundations/summary.mp4', 5, 0);

INSERT INTO external_course_lesson_i18n (course_slug, lesson_id, locale, title) VALUES
  ('gisha-gmisha-foundations', 'summary', 'he', 'סיכום'),
  ('gisha-gmisha-foundations', 'summary', 'en', 'Summary');
