-- External courses: curated affiliate/paid course listings from third-party
-- providers, linked out from a dedicated /external-courses page. Seeded from
-- lib/external-courses.ts + mocks/content/{en,he}.json.

CREATE TABLE external_courses (
  slug TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  price_display TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE external_course_i18n (
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (slug, locale),
  FOREIGN KEY (slug) REFERENCES external_courses(slug) ON DELETE CASCADE
);

INSERT INTO external_courses (slug, provider, price_display, affiliate_url, sort_order) VALUES
  ('steez-academy-hiphop-foundations', 'Steez Academy', '$29/mo', 'https://example.com/steez-academy?ref=theframe', 0),
  ('urban-motion-jazzfunk-intensive', 'Urban Motion Studio', '$149 one-time', 'https://example.com/urban-motion?ref=theframe', 1),
  ('heels-and-heart-confidence-course', 'Heels & Heart', '$39/mo', 'https://example.com/heels-and-heart?ref=theframe', 2),
  ('movement-lab-contemporary-lines', 'The Movement Lab', '$59/mo', 'https://example.com/movement-lab?ref=theframe', 3),
  ('rhythm-collective-afrobeats-bootcamp', 'Rhythm Collective', '$25/mo', 'https://example.com/rhythm-collective?ref=theframe', 4),
  ('dancehall-society-vibes-101', 'Dancehall Society', '$19/mo', 'https://example.com/dancehall-society?ref=theframe', 5);

INSERT INTO external_course_i18n (slug, locale, title, tagline, description) VALUES
  ('steez-academy-hiphop-foundations', 'he', 'יסודות היפ הופ', 'תוכנית מקוונת למתחילים באורך 8 שבועות', 'קורס מבוא להיפ הופ באורך 8 שבועות שמכסה גרוב, איזולציות ובסיס לפריסטייל, עם משוב שבועי.'),
  ('urban-motion-jazzfunk-intensive', 'he', 'אינטנסיב ג''אז פאנק', 'אינטנסיב של 6 שיעורים עם פירוק כוריאוגרפיה', 'אינטנסיב ג''אז פאנק ממוקד עם שישה פירוקי כוריאוגרפיה מלאים ממדריכים שמופיעים בעולם.'),
  ('heels-and-heart-confidence-course', 'he', 'קורס ביטחון בעקבים', 'שליטה בעקב, הליכות ועבודת רצפה לכל רמה', 'קורס עקבים שבונה שליטה, הליכות ועבודת רצפה מהבסיס, עם מודולים לכל רמה.'),
  ('movement-lab-contemporary-lines', 'he', 'טכניקה וקו בקונטמפררי', 'אימון קונטמפררי מבוסס טכניקה', 'תוכנית קונטמפררי מבוססת טכניקה שמתמקדת בקו, שליטה ואיכות תנועה ביטויית.'),
  ('rhythm-collective-afrobeats-bootcamp', 'he', 'בוטקמפ אפרוביטס', 'יסודות אפרוביטס באנרגייה גבוהה', 'בוטקמפ אפרוביטס באנרגייה גבוהה שמכסה גרובים בסיסיים, איזולציות ותרגול קומבינציות.'),
  ('dancehall-society-vibes-101', 'he', 'דאנסהול וייבס 101', 'בסיס לבאונס ווייב בדאנסהול', 'קורס דאנסהול למתחילים לחלוטין שבונה באונס, וייב ומוזיקליות.'),
  ('steez-academy-hiphop-foundations', 'en', 'Hip-Hop Foundations', '8-week beginner hip-hop program, fully online', 'A structured 8-week hip-hop foundations course covering grooves, isolations, and freestyle basics, with weekly feedback.'),
  ('urban-motion-jazzfunk-intensive', 'en', 'Jazz-Funk Intensive', '6-class intensive with choreography breakdowns', 'A focused jazz-funk intensive with six full-length choreography breakdowns from touring instructors.'),
  ('heels-and-heart-confidence-course', 'en', 'Heels Confidence Course', 'Heel control, walks, and floorwork for every level', 'A heels-focused course building control, walks, and floorwork from the ground up, with modules for every level.'),
  ('movement-lab-contemporary-lines', 'en', 'Contemporary Lines & Technique', 'Technique-driven contemporary training', 'A technique-driven contemporary program focused on line, control, and expressive movement quality.'),
  ('rhythm-collective-afrobeats-bootcamp', 'en', 'Afrobeats Bootcamp', 'High-energy afrobeats fundamentals', 'A high-energy afrobeats bootcamp covering core grooves, isolations, and combo drilling.'),
  ('dancehall-society-vibes-101', 'en', 'Dancehall Vibes 101', 'Foundational dancehall bounce and vibe', 'An entry-level dancehall course building bounce, vibe, and musicality for total beginners.');

CREATE INDEX external_course_i18n_locale_idx
  ON external_course_i18n (locale);
