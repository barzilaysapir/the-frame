-- Real (non-mock) video lessons for external courses, gated behind login and
-- streamed from a private Cloudflare R2 bucket (`the-frame-class-videos`) —
-- see lib/server/course-videos.ts and app/api/v1/external-courses/[slug]/
-- lessons/[lessonId]/{playback-url,stream}. Mirrors the shape of
-- lib/external-courses.ts's `ExternalCourseRecord.lessons`.
--
-- Deliberately separate from `routine_chapters` (migrations/0001): routine
-- chapters are timestamps *within one shared video file*, while a course
-- lesson is its own standalone video file in R2 — different enough
-- semantics (and different join keys) to not force them into one table.

CREATE TABLE external_course_lessons (
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (course_slug, lesson_id),
  FOREIGN KEY (course_slug) REFERENCES external_courses(slug) ON DELETE CASCADE
);

CREATE TABLE external_course_lesson_i18n (
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  PRIMARY KEY (course_slug, lesson_id, locale),
  FOREIGN KEY (course_slug, lesson_id)
    REFERENCES external_course_lessons(course_slug, lesson_id) ON DELETE CASCADE
);

CREATE INDEX external_course_lessons_course_idx
  ON external_course_lessons (course_slug);

-- First real course (not a mock "coming soon" stub) — provider/title copy
-- is placeholder pending confirmation; price is TBD until the real number is
-- set (see migrations/0014 for the pattern of a follow-up migration fixing
-- seeded prices once known).
INSERT INTO external_courses (slug, provider, price_display, sort_order) VALUES
  ('gisha-gmisha-foundations', 'גישה גמישה', 'מחיר בקרוב', 6);

INSERT INTO external_course_i18n (slug, locale, title, tagline, description) VALUES
  ('gisha-gmisha-foundations', 'he', 'יסודות', 'קורס יסודות מבית גישה גמישה — טקסט סופי בהמתנה לאישור', 'תיאור מלא לקורס יסודות מבית גישה גמישה יעודכן כאן בקרוב.'),
  ('gisha-gmisha-foundations', 'en', 'Foundations', 'A foundations course by Gisha Gmisha — final copy pending approval', 'Full description for the Gisha Gmisha Foundations course will be added here soon.');

INSERT INTO external_course_lessons (course_slug, lesson_id, r2_key, sort_order) VALUES
  ('gisha-gmisha-foundations', 'warmup', 'external-courses/gisha-gmisha/foundations/warmup.mp4', 0);

INSERT INTO external_course_lesson_i18n (course_slug, lesson_id, locale, title) VALUES
  ('gisha-gmisha-foundations', 'warmup', 'he', 'חימום'),
  ('gisha-gmisha-foundations', 'warmup', 'en', 'Warm-up');
