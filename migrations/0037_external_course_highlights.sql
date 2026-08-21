-- Breaks the long vibe-on-heels description into a short intro plus a
-- scannable bullet list (curriculum, format, logistics) — same JSON-array-
-- in-a-TEXT-column pattern as routines.tags_json. Other external courses get
-- an empty array; the column defaults to '[]' so existing rows stay valid.

ALTER TABLE external_course_i18n
  ADD COLUMN highlights_json TEXT NOT NULL DEFAULT '[]';

UPDATE external_course_i18n
  SET
    description = 'בין אם זו הפעם הראשונה שלך על עקבים או שאת רוצה לשפר טכניקה – הקורס מתאים למתחילות ולמתקדמות, ולומדת מתי שנוח לך: בסלון, בחדר השינה או בכל מקום אחר.',
    highlights_json = '["עשרה שיעורים קצרים שבונים את הבסיס: מושגי יסוד, עמידות, הליכות, שיווי משקל, פאסה, וויבים, וויפים, lay out ושמיניות","קומבינציה מסכמת שתוכלי ליהנות לרקוד מהתחלה ועד הסוף","לא נדרש ניסיון קודם ולא נעל עקב ספציפית כדי להתחיל","מותאם ללמידה מהבית – אין עבודת רצפה וכל חדר סטנדרטי מתאים","גישה לקורס פתוחה ללא הגבלת זמן"]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';

UPDATE external_course_i18n
  SET
    description = 'Whether it''s your first time in heels or you want to sharpen your technique, this course works for beginners and improvers alike - learn whenever suits you, in your living room, your bedroom, or anywhere else.',
    highlights_json = '["Ten short lessons that build your foundation: core concepts, stance, walks, balance, passe, vibes, whips, lay-outs and figure eights","A final combo you''ll love dancing from start to finish","No prior experience or specific heel required to start","Built for learning at home - no floor work, so any standard room works","Unlimited-time access to the course"]'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
