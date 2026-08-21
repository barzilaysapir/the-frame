-- Add the three favorite landing-page chips alongside the existing four.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי להתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית"},{"icon":"standing","label":"בלי עבודת רצפה"},{"icon":"users","label":"למתחילות ולמתקדמות"},{"icon":"music","label":"קומבינציה מסכמת"},{"icon":"list","label":"עשרה שיעורים קצרים"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home"},{"icon":"standing","label":"No floor work"},{"icon":"users","label":"Beginners and improvers"},{"icon":"music","label":"Final combo"},{"icon":"list","label":"Ten short lessons"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
