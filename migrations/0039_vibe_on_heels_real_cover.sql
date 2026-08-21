-- Replaces the placeholder cover (a generic routine poster shared with
-- unrelated routines, seeded in 0033) with the course's own title-card art.
UPDATE external_courses
SET cover_image = '/course-covers/vibe-on-heels.png'
WHERE slug = 'vibe-on-heels';
