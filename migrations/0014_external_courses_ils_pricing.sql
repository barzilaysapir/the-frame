-- The Frame is an ILS-only business (see routine pricing, checkout, and
-- purchases.amount_ils) — the demo USD price strings seeded in
-- migrations/0012_external_courses.sql were inconsistent with that. Update
-- them to ₪ display strings to match lib/external-courses.ts.

UPDATE external_courses SET price_display = '₪99/mo' WHERE slug = 'steez-academy-hiphop-foundations';
UPDATE external_courses SET price_display = '₪449 one-time' WHERE slug = 'urban-motion-jazzfunk-intensive';
UPDATE external_courses SET price_display = '₪129/mo' WHERE slug = 'heels-and-heart-confidence-course';
UPDATE external_courses SET price_display = '₪179/mo' WHERE slug = 'movement-lab-contemporary-lines';
UPDATE external_courses SET price_display = '₪89/mo' WHERE slug = 'rhythm-collective-afrobeats-bootcamp';
UPDATE external_courses SET price_display = '₪69/mo' WHERE slug = 'dancehall-society-vibes-101';
