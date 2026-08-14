-- Replace the placeholder warmup lesson (that R2 object was never uploaded)
-- with the four completed Gisha Gmisha foundations videos. Skip summary.mp4
-- (multipart upload still in progress). Matches lib/external-courses.ts +
-- mocks/content/{en,he}.json.

DELETE FROM external_course_lesson_i18n
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'warmup';

DELETE FROM external_course_lessons
  WHERE course_slug = 'gisha-gmisha-foundations' AND lesson_id = 'warmup';

INSERT INTO external_course_lessons (course_slug, lesson_id, r2_key, sort_order) VALUES
  ('gisha-gmisha-foundations', 'head-neck', 'external-courses/gisha-gmisha/foundations/head-neck.mp4', 0),
  ('gisha-gmisha-foundations', 'shoulder-blades', 'external-courses/gisha-gmisha/foundations/shoulder-blades.mp4', 1),
  ('gisha-gmisha-foundations', 'shoulder-blades-physio-exercise', 'external-courses/gisha-gmisha/foundations/shoulder-blades-physio-exercise.mp4', 2),
  ('gisha-gmisha-foundations', 'spine-abs', 'external-courses/gisha-gmisha/foundations/spine-abs.mp4', 3);

INSERT INTO external_course_lesson_i18n (course_slug, lesson_id, locale, title) VALUES
  ('gisha-gmisha-foundations', 'head-neck', 'he', 'ראש וצוואר'),
  ('gisha-gmisha-foundations', 'head-neck', 'en', 'Head & neck'),
  ('gisha-gmisha-foundations', 'shoulder-blades', 'he', 'שכמות'),
  ('gisha-gmisha-foundations', 'shoulder-blades', 'en', 'Shoulder blades'),
  ('gisha-gmisha-foundations', 'shoulder-blades-physio-exercise', 'he', 'תרגיל פיזיותרפיה לשכמות'),
  ('gisha-gmisha-foundations', 'shoulder-blades-physio-exercise', 'en', 'Shoulder blades physio exercise'),
  ('gisha-gmisha-foundations', 'spine-abs', 'he', 'עמוד שדרה ובטן'),
  ('gisha-gmisha-foundations', 'spine-abs', 'en', 'Spine & abs');
