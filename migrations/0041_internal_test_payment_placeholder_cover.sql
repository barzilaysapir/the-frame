-- zzz-internal-test-payment (the "Internal test — do not purchase" card,
-- see migrations/0040_seed_internal_test_payment.sql) was created directly
-- against remote D1 with an empty cover_image, which crashes the library
-- card's next/image (empty src). Give it a placeholder like every other
-- course without real photography yet.

UPDATE external_courses
SET cover_image = '/routine-posters/routine-poster-city-glam.png'
WHERE slug = 'zzz-internal-test-payment';
