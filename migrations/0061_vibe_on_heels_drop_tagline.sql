-- Drop the Vibe on Heels tagline; the description and feature chips cover it.

UPDATE external_course_i18n
  SET tagline = ''
  WHERE slug = 'vibe-on-heels';
