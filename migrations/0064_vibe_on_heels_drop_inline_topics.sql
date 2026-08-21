-- Drop the inline topic list from the description; the chips already cover it.

UPDATE external_course_i18n
  SET description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות. עשרה שיעורים קצרים שבונים את הבסיס לריקוד על עקבים, עד לקומבינציה מסכמת שתוכלי ליהנות לרקוד מהתחלה ועד הסוף. הקורס נבנה במיוחד ללמידה מהבית: אין עבודת רצפה וכל חדר סטנדרטי מתאים, והגישה פתוחה ללא הגבלת זמן.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike. Ten short lessons build your foundation, leading up to a final combo you''ll love dancing start to finish. Built specifically for learning at home: no floor work, so any standard room works, with unlimited-time access.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
