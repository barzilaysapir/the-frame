-- Timestamps within one course-lesson video (same player chapters as routines).
-- Polymorphic `course_kind` so external courses work today and internal
-- courses can reuse this table when that catalog lands — no second chapters
-- schema later. Labels reuse shared `chapter_i18n` (same as routine_chapters).
-- No FK to lesson tables: internal_course lessons do not exist yet, and
-- favorites/purchases already use the same polymorphic pattern without FKs.

CREATE TABLE course_lesson_chapters (
  course_kind TEXT NOT NULL CHECK (course_kind IN ('external_course', 'internal_course')),
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  time_seconds INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (course_kind, course_slug, lesson_id, chapter_id)
);

CREATE INDEX course_lesson_chapters_lesson_idx
  ON course_lesson_chapters (course_kind, course_slug, lesson_id, sort_order);
