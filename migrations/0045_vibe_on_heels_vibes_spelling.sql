-- Hebrew curriculum chip: "וויבים" → "ווייבים" (vibes).

UPDATE external_course_i18n
  SET curriculum_topics_json = '["מושגי יסוד","עמידות","הליכות","שיווי משקל","פאסה","ווייבים","וויפים","Lay Out","שמיניות","קומבינציה מסכמת"]'
  WHERE slug = 'vibe-on-heels' AND locale = 'he';
