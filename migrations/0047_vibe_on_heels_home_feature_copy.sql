-- Hebrew feature chip: made for learning at home, no floor work.

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי בשביל ההתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית, בלי עבודת רצפה"},{"icon":"infinity","label":"גישה ללא הגבלת זמן"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home, no floor work"},{"icon":"infinity","label":"Unlimited-time access"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
