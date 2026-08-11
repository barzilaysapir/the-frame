-- Rename the "commercial" dance style to "voguing" (content decision, not a
-- schema change). Never edit 0007_catalog_seed_expansion.sql (already
-- applied) — this additive migration updates those rows in place instead.
-- The former commercial-spotlight poster photo now belongs to jazz-funk
-- (routine-poster-midnight-static.png on disk); voguing gets its own new
-- poster (routine-poster-voguing-spotlight.png).

UPDATE style_i18n SET style_key = 'voguing', label = 'ווגינג'
  WHERE style_key = 'commercial' AND locale = 'he';
UPDATE style_i18n SET style_key = 'voguing', label = 'Voguing'
  WHERE style_key = 'commercial' AND locale = 'en';

UPDATE instructors SET style = 'voguing' WHERE style = 'commercial';

UPDATE instructor_i18n SET bio = REPLACE(bio, 'קומרשיאל', 'ווגינג')
  WHERE locale = 'he' AND bio LIKE '%קומרשיאל%';
UPDATE instructor_i18n SET bio = REPLACE(bio, 'Commercial', 'Voguing')
  WHERE locale = 'en' AND bio LIKE '%Commercial%';

UPDATE routines
  SET style = 'voguing',
      poster = '/routine-poster-voguing-spotlight.png',
      tags_json = REPLACE(tags_json, '"commercial"', '"voguing"')
  WHERE style = 'commercial';

UPDATE routine_i18n
  SET technique = REPLACE(REPLACE(technique, 'קומרשיאל', 'ווגינג'), 'מסחרי', 'ווגינג'),
      description = REPLACE(REPLACE(description, 'קומרשיאל', 'ווגינג'), 'מסחרי', 'ווגינג')
  WHERE locale = 'he'
    AND slug IN (SELECT slug FROM routines WHERE style = 'voguing');

UPDATE routine_i18n
  SET technique = REPLACE(technique, 'commercial', 'voguing'),
      description = REPLACE(REPLACE(description, 'Commercial', 'Voguing'), 'commercial', 'voguing')
  WHERE locale = 'en'
    AND slug IN (SELECT slug FROM routines WHERE style = 'voguing');
