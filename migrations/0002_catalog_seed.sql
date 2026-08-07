/**
 * Seed SQL for D1 from the current mock catalog.
 * Generated for local/remote `wrangler d1 execute` — keep in sync when mocks change
 * until an admin CMS writes to D1 directly.
 */
-- Styles
INSERT INTO style_i18n (style_key, locale, label) VALUES
  ('jazz-funk', 'he', 'ג''אז פאנק'),
  ('hip-hop', 'he', 'היפ הופ'),
  ('heels', 'he', 'עקבים'),
  ('jazz-funk', 'en', 'Jazz Funk'),
  ('hip-hop', 'en', 'Hip Hop'),
  ('heels', 'en', 'Heels');

INSERT INTO level_i18n (level_key, locale, label) VALUES
  ('intermediate', 'he', 'בינוני'),
  ('advanced', 'he', 'מתקדם'),
  ('all-levels', 'he', 'כל הרמות'),
  ('intermediate', 'en', 'Intermediate'),
  ('advanced', 'en', 'Advanced'),
  ('all-levels', 'en', 'All levels');

INSERT INTO chapter_i18n (chapter_id, locale, label) VALUES
  ('full-performance', 'he', 'הופעה מלאה'),
  ('breakdown', 'he', 'פירוק תנועות (ספירות)'),
  ('slow-practice', 'he', 'תרגול איטי (50%)'),
  ('full-speed', 'he', 'תרגול במהירות מלאה (100%)'),
  ('full-performance', 'en', 'Full performance'),
  ('breakdown', 'en', 'Movement breakdown (counts)'),
  ('slow-practice', 'en', 'Slow practice (50%)'),
  ('full-speed', 'en', 'Full-speed practice (100%)');

INSERT INTO locale_meta (locale, minutes_label) VALUES
  ('he', 'דקות'),
  ('en', 'min');

INSERT INTO instructors (slug, style, avatar, instagram_url) VALUES
  ('maya-azulai', 'jazz-funk', '/instructors/maya-azulai.jpg', 'https://www.instagram.com/'),
  ('daniel-cohen', 'hip-hop', '/instructors/daniel-cohen.jpg', 'https://www.instagram.com/'),
  ('noa-sagi', 'heels', '/instructors/noa-sagi.jpg', 'https://www.instagram.com/');

INSERT INTO instructor_i18n (slug, locale, name, bio) VALUES
  ('maya-azulai', 'he', 'מאיה אזולאי', 'מלמדת ג''אז פאנק — גרוב ופרפורמנס.'),
  ('daniel-cohen', 'he', 'דניאל כהן', 'מלמד היפ הופ — גרוב, מוזיקליות ופירוק שיטתי.'),
  ('noa-sagi', 'he', 'נועה שגיא', 'מלמדת עקבים — שליטה בעקב, אורך קו ופרפורמנס.'),
  ('maya-azulai', 'en', 'Maya Azulai', 'Teaches Jazz Funk — groove and performance.'),
  ('daniel-cohen', 'en', 'Daniel Cohen', 'Teaches Hip Hop — groove, musicality, and systematic breakdown.'),
  ('noa-sagi', 'en', 'Noa Sagi', 'Teaches Heels — heel control, line, and performance.');

INSERT INTO routines (
  slug, title, song_name, artist, instructor_slug, level, style, tags_json,
  bpm, length, poster, video_src, price_original, price_early_bird
) VALUES
  (
    'levitating', 'Levitating', 'Levitating', 'Dua Lipa', 'maya-azulai',
    'intermediate', 'jazz-funk', '["jazz-funk","performance"]',
    '103 BPM', '3:23', '/routine-poster-midnight-static.png',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    198, 99
  ),
  (
    'kill-bill', 'Kill Bill', 'Kill Bill', 'SZA', 'daniel-cohen',
    'advanced', 'hip-hop', '["hip-hop","groove","musicality"]',
    '89 BPM', '2:33', '/routine-poster-neon-nights.png',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    198, 99
  ),
  (
    'earned-it', 'Earned It', 'Earned It', 'The Weeknd', 'noa-sagi',
    'all-levels', 'heels', '["heels","body-control","performance"]',
    '120 BPM', '4:10', '/routine-poster-velvet-heels.png',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    198, 99
  );

INSERT INTO routine_i18n (slug, locale, technique, description) VALUES
  (
    'levitating', 'he',
    'מעברי משקל קרקעיים ופרפורמנס',
    'קומבינציית ג''אז פאנק אנרגטית עם דגש על גרוב ופרפורמנס, מושלמת לרקדנים שרוצים לשדרג את הביטוי האישי שלהם על הבמה.'
  ),
  (
    'kill-bill', 'he',
    'גרוב, פוליריתמיקה ועבודת רצפה',
    'קומבינציית היפ הופ עוצמתית שבנויה על גרוב עמוק ומעברים חדים בין התנועות, לרקדנים שרוצים להעמיק בסגנון עם דגש טכני גבוה.'
  ),
  (
    'earned-it', 'he',
    'אורך קו, שליטה בעקב ופרפורמנס',
    'קומבינציית עקבים מפתה ובטוחה, שמלמדת איך לשלוט בעקב מבלי לוותר על טכניקה — כולל דגשים על יציבה, אורך קו ופרפורמנס.'
  ),
  (
    'levitating', 'en',
    'Grounded weight shifts and performance',
    'An energetic Jazz Funk combination focused on groove and performance — ideal for dancers who want to sharpen their stage expression.'
  ),
  (
    'kill-bill', 'en',
    'Groove, polyrhythm, and floorwork',
    'A powerful Hip Hop combination built on deep groove and sharp transitions — for dancers who want a high technical emphasis.'
  ),
  (
    'earned-it', 'en',
    'Line, heel control, and performance',
    'A seductive Heels combination that teaches heel control without sacrificing technique — including posture, line, and performance.'
  );

INSERT INTO routine_chapters (routine_slug, chapter_id, time_seconds, sort_order) VALUES
  ('levitating', 'full-performance', 0, 0),
  ('levitating', 'breakdown', 22, 1),
  ('levitating', 'slow-practice', 58, 2),
  ('levitating', 'full-speed', 96, 3),
  ('kill-bill', 'full-performance', 0, 0),
  ('kill-bill', 'breakdown', 20, 1),
  ('kill-bill', 'slow-practice', 55, 2),
  ('kill-bill', 'full-speed', 92, 3),
  ('earned-it', 'full-performance', 0, 0),
  ('earned-it', 'breakdown', 24, 1),
  ('earned-it', 'slow-practice', 60, 2),
  ('earned-it', 'full-speed', 98, 3);
