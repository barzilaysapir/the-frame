-- external_courses also mixes demo placeholders (fake "example.com"
-- affiliate listings, see migrations/0012_external_courses.sql) with the one
-- real course. Same is_demo mechanism as migrations/0027_add_is_demo_flag.sql.
ALTER TABLE external_courses ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 1;

UPDATE external_courses SET is_demo = 0 WHERE slug = 'gisha-gmisha-foundations';
