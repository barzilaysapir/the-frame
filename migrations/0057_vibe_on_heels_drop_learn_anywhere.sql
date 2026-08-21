-- Drop the "learn whenever / living room" sentence from the intro.

UPDATE external_course_i18n
  SET description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
