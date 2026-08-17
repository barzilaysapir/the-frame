-- external_courses.provider was always free text, with no real link to
-- instructors — so filtering the library by an instructor could never
-- surface their external course (see the "instructor only exists on
-- routines" comment in useRoutineFilters.ts, now stale). Add a real FK.
ALTER TABLE external_courses ADD COLUMN instructor_slug TEXT REFERENCES instructors(slug);

UPDATE external_courses SET instructor_slug = 'yahel-hayat' WHERE slug = 'gisha-gmisha-foundations';
