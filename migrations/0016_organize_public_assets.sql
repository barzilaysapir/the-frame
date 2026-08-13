-- Additive fix: public/ moved its flat routine-poster-*.png files into a
-- public/routine-posters/ subfolder (see scripts/*.mjs and lib/routines.ts
-- for the matching code-side path updates). Prepends the new folder segment
-- to every existing routines.poster value so remote D1 matches the new
-- asset layout — filenames themselves are unchanged, only their path.
--
-- Instructor avatars stay under public/instructors/ (already organized,
-- not moved), so instructors.avatar needs no update here.

UPDATE routines SET poster = '/routine-posters' || poster WHERE poster LIKE '/routine-poster-%';
