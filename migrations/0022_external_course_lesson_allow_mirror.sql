-- Per-lesson flag for the player horizontal-flip control. Default ON
-- (1) so existing and new lessons start mirrored with the button shown.
-- Set 0 for footage that is already mirrored in edit or has captions.

ALTER TABLE external_course_lessons
  ADD COLUMN allow_mirror INTEGER NOT NULL DEFAULT 1;
