-- Heel chip: you can start with any heel.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"אפשר להתחיל עם כל עקב"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"music","label":"קומבינציה מסכמת"},{"icon":"list","label":"עשרה שיעורים קצרים"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"Start with any heel"},{"icon":"home","label":"Made for learning at home"},{"icon":"music","label":"Final combo"},{"icon":"list","label":"Ten short lessons"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
