-- English tagline for vibe-on-heels dropped the "in Israel" framing in favor
-- of a country-agnostic phrasing, so the English copy doesn't tie the
-- course to a specific market. Hebrew copy (migration 0035) is unaffected.

UPDATE external_course_i18n
  SET tagline = 'The only digital course of its kind that teaches you to dance in heels from home, at your own pace, with zero pressure.'
  WHERE slug = 'vibe-on-heels' AND locale = 'en';
