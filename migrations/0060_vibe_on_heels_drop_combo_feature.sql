-- Drop the "final combo" feature chip (the curriculum topic chip stays).

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"אפשר להתחיל עם כל עקב"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"list","label":"עשרה שיעורים קצרים"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"Start with any heel"},{"icon":"home","label":"Made for learning at home"},{"icon":"list","label":"Ten short lessons"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
