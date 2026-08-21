-- Hebrew heel chip: no specific heel needed to start.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי להתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"music","label":"בלי לחץ ובלי השוואות"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home"},{"icon":"music","label":"No pressure, no comparisons"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
