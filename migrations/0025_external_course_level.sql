-- Library level for external courses (Gisha Gmisha foundations = beginner).

ALTER TABLE external_courses ADD COLUMN level TEXT;

UPDATE external_courses
SET level = 'beginner'
WHERE slug = 'gisha-gmisha-foundations';
