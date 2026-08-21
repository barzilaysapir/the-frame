-- Remove the curriculum heading above the topic chips.

UPDATE external_course_i18n
  SET curriculum_heading = ''
  WHERE slug = 'vibe-on-heels';
