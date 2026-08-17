-- Swap the generic routine-poster placeholder for the real cover art
-- delivered for the course: a title-card frame (dancer at sunset overlooking
-- the city, with the course title and instructor name burned in).

UPDATE external_courses SET cover_image = '/course-covers/gisha-gmisha-foundations.jpg'
  WHERE slug = 'gisha-gmisha-foundations';
