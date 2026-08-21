-- Pace chip icon: music no longer fits after dropping "just you and the music".

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי להתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"heart","label":"בלי לחץ ובלי השוואות"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home"},{"icon":"heart","label":"No pressure, no comparisons"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
