-- Replace the reused routine-poster placeholder on the "internal test — do
-- not purchase" card (migrations/0041_internal_test_payment_placeholder_cover.sql)
-- with a dedicated real brand photo.

UPDATE external_courses
SET cover_image = '/routine-posters/routine-poster-frame-studio.png'
WHERE slug = 'zzz-internal-test-payment';
