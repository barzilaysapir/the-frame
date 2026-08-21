-- The Hebrew Vibe on Heels intro joined two different subjects in one
-- clause ("הקורס מתאים …, ולומדת"), which reads as if the course itself
-- is learning. Split back into two sentences, matching the original 0035
-- wording of that break.

UPDATE external_course_i18n
  SET description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות. לומדת מתי שנוח לך: בסלון, בחדר השינה או בכל מקום אחר.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';
