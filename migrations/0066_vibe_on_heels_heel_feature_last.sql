-- Move the "start with any heel" chip to last in the feature row.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"list","label":"עשרה שיעורים קצרים"},{"icon":"footprints","label":"אפשר להתחיל עם כל עקב"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"home","label":"Made for learning at home"},{"icon":"list","label":"Ten short lessons"},{"icon":"footprints","label":"Start with any heel"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
