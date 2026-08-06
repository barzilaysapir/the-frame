-- Catalog schema for The Frame (Cloudflare D1)

CREATE TABLE instructors (
  slug TEXT PRIMARY KEY NOT NULL,
  style TEXT NOT NULL,
  avatar TEXT NOT NULL,
  instagram_url TEXT NOT NULL
);

CREATE TABLE instructor_i18n (
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (slug, locale),
  FOREIGN KEY (slug) REFERENCES instructors(slug) ON DELETE CASCADE
);

CREATE TABLE routines (
  slug TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  song_name TEXT NOT NULL,
  artist TEXT NOT NULL,
  instructor_slug TEXT NOT NULL,
  level TEXT NOT NULL,
  style TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  bpm TEXT NOT NULL,
  length TEXT NOT NULL,
  poster TEXT NOT NULL,
  video_src TEXT NOT NULL,
  price_original INTEGER NOT NULL,
  price_early_bird INTEGER NOT NULL,
  FOREIGN KEY (instructor_slug) REFERENCES instructors(slug)
);

CREATE TABLE routine_i18n (
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  technique TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (slug, locale),
  FOREIGN KEY (slug) REFERENCES routines(slug) ON DELETE CASCADE
);

CREATE TABLE routine_chapters (
  routine_slug TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  time_seconds INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (routine_slug, chapter_id),
  FOREIGN KEY (routine_slug) REFERENCES routines(slug) ON DELETE CASCADE
);

CREATE TABLE style_i18n (
  style_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (style_key, locale)
);

CREATE TABLE level_i18n (
  level_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (level_key, locale)
);

CREATE TABLE chapter_i18n (
  chapter_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (chapter_id, locale)
);

CREATE TABLE locale_meta (
  locale TEXT PRIMARY KEY NOT NULL,
  minutes_label TEXT NOT NULL
);
