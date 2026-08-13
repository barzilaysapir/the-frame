-- "More courses" pivoted from third-party affiliate listings to The Frame's
-- own additional course content (see migrations/0012_external_courses.sql).
-- The outbound affiliate link is no longer used — course pages are internal
-- (`/[locale]/external-courses/[slug]`) — so drop the now-unused column.

ALTER TABLE external_courses DROP COLUMN affiliate_url;
