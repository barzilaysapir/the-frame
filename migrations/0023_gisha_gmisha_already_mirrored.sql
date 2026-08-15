-- Gisha Gmisha foundations footage is already mirrored in edit.
-- Hide the player flip control for every lesson of this course.

UPDATE external_course_lessons
  SET allow_mirror = 0
  WHERE course_slug = 'gisha-gmisha-foundations';
