-- Drop the at-home / no-floor-work / unlimited-access sentence from the description.

UPDATE external_course_i18n
  SET description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות. עשרה שיעורים קצרים שבונים את הבסיס לריקוד על עקבים, עד לקומבינציה מסכמת שתוכלי ליהנות לרקוד מהתחלה ועד הסוף.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike. Ten short lessons build your foundation, leading up to a final combo you''ll love dancing start to finish.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
