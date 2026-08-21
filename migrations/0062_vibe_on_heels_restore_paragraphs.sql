-- Restore the tagline and the "learn whenever / living room" description sentence.

UPDATE external_course_i18n
  SET
    tagline = 'הקורס הדיגיטלי היחיד בארץ שילמד אותך לרקוד על עקבים מהבית, בקצב שלך, בלי לחץ.',
    description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות. לומדת מתי שנוח לך: בסלון, בחדר השינה או בכל מקום אחר.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET
    tagline = 'The only digital course of its kind that teaches you to dance in heels from home, at your own pace, with zero pressure.',
    description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike - learn whenever suits you, in your living room, your bedroom, or anywhere else.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
