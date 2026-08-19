-- Real tagline/description for vibe-on-heels, sourced from the course's own
-- landing page (Daniel Lani's Canva site), replacing the blank placeholders
-- seeded in migration 0033. Matches mocks/content/{en,he}.json.

UPDATE external_course_i18n
  SET
    tagline = 'הקורס הדיגיטלי היחיד בארץ שילמד אותך לרקוד על עקבים מהבית, בקצב שלך, בלי לחץ.',
    description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות. לומדת מתי שנוח לך: בסלון, בחדר השינה, בכל מקום שתרצי, בלי צורך בניסיון קודם או בנעל עקב ספציפית. עשרה שיעורים קצרים שבונים את הבסיס לריקוד על עקבים – מושגי יסוד, עמידות, הליכות, שיווי משקל, פאסה, וויבים, וויפים, lay out ושמיניות – ועד לקומבינציה מסכמת שתוכלי ליהנות לרקוד מהתחלה ועד הסוף. הקורס נבנה במיוחד ללמידה מהבית: אין עבודת רצפה וכל חדר סטנדרטי מתאים, והגישה פתוחה ללא הגבלת זמן.'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET
    tagline = 'The only digital course in Israel that teaches you to dance in heels from home, at your own pace, with zero pressure.',
    description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike. Learn whenever suits you - in your living room, your bedroom, anywhere you like - no prior experience or specific heel required. Ten short lessons build your foundation: core concepts, stance, walks, balance, passe, vibes, whips, lay-outs and figure eights - leading up to a final combo you''ll love dancing start to finish. Built specifically for learning at home: no floor work, so any standard room works, with unlimited-time access.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
