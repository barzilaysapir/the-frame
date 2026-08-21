-- Replace the unlimited-access chip with the landing-page line:
-- "בלי לחץ, בלי השוואות, רק את והמוזיקה".

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"לא נדרש ניסיון קודם"},{"icon":"footprints","label":"לא חייב עקב ספציפי בשביל ההתחלה"},{"icon":"home","label":"מותאם ללמידה מהבית, בלי עבודת רצפה"},{"icon":"music","label":"בלי לחץ, בלי השוואות, רק את והמוזיקה"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET features_json = '[{"icon":"sparkles","label":"No experience needed"},{"icon":"footprints","label":"No specific heel needed to start"},{"icon":"home","label":"Made for learning at home, no floor work"},{"icon":"music","label":"No pressure, no comparisons, just you and the music"}]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
