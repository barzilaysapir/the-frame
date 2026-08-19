-- Public (ungated) promo clip for an external course, shown on the
-- coming-soon / detail page so visitors can watch a preview without
-- signing in. Empty string means no promo. Files live in public/ so they
-- ship as static assets rather than through the private R2 lesson bucket
-- (see lib/server/course-videos.ts). First clip is Daniel Lani's Vibe on
-- Heels Facebook promo (https://www.facebook.com/share/v/1Ex2zB2Qhs/).

ALTER TABLE external_courses ADD COLUMN promo_video TEXT NOT NULL DEFAULT '';
ALTER TABLE external_courses ADD COLUMN promo_poster TEXT NOT NULL DEFAULT '';

UPDATE external_courses
  SET
    promo_video = '/course-promos/vibe-on-heels.mp4',
    promo_poster = '/course-promos/vibe-on-heels.jpg'
  WHERE slug = 'vibe-on-heels';
