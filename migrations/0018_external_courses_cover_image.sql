-- External courses now render as cards in the main routines grid (see
-- migration for PR #200 / app/[locale]/routines/page.tsx), same as routine
-- cards — they need a poster image too. Reuses existing generic
-- `routine-posters/` art as a placeholder, same as several routines already
-- do, until real course cover art is ready.
--
-- Also reorders so gisha-gmisha-foundations (the one course with real,
-- watchable lessons) leads instead of trailing the still-mock stubs.

ALTER TABLE external_courses ADD COLUMN cover_image TEXT NOT NULL DEFAULT '';

UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-amber-loft.png', sort_order = 0
  WHERE slug = 'gisha-gmisha-foundations';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-street-cypher.png', sort_order = 1
  WHERE slug = 'steez-academy-hiphop-foundations';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-jazz-glow.png', sort_order = 2
  WHERE slug = 'urban-motion-jazzfunk-intensive';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-penthouse-heels.png', sort_order = 3
  WHERE slug = 'heels-and-heart-confidence-course';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-spotlight-lyrical.png', sort_order = 4
  WHERE slug = 'movement-lab-contemporary-lines';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-afro-groove.png', sort_order = 5
  WHERE slug = 'rhythm-collective-afrobeats-bootcamp';
UPDATE external_courses SET cover_image = '/routine-posters/routine-poster-dancehall-block.png', sort_order = 6
  WHERE slug = 'dancehall-society-vibes-101';
