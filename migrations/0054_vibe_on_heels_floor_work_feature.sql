-- Fourth chip: course-specific "no floor work" from the landing page,
-- instead of the site-wide "no pressure, no comparisons" line.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי להתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"standing","label":"בלי עבודת רצפה"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home"},{"icon":"standing","label":"No floor work"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
