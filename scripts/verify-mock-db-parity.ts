/**
 * Verifies that the hand-maintained TS/JSON mocks (`lib/routines.ts`,
 * `lib/instructors.ts`, `mocks/content/{he,en}.json`) are byte-for-byte
 * consistent with the local D1 catalog seed (`migrations/*.sql`, applied to
 * `.wrangler` local state).
 *
 * Local D1 is the source of truth developers actually see day to day (plain
 * `next dev` already reads it via `initOpenNextCloudflareForDev`'s wrangler
 * platform proxy — see `next.config.mjs`). The TS/JSON mocks only matter as
 * the last-resort in-memory fallback (`lib/server/catalog/mock-repository.ts`)
 * used when no local D1 state exists yet (fresh clone before the first
 * `npm run db:migrate:local`, or a CI build with no `.wrangler` dir). This
 * script exists so that fallback can never silently drift from the real seed.
 *
 * Usage: node scripts/verify-mock-db-parity.ts
 * Exits non-zero (with a diff-style report) on any mismatch.
 *
 * Note: this reads `lib/routines.ts` / `lib/instructors.ts` as *text* rather
 * than importing them, because those files use the `@/*` path alias that
 * plain `node` (no bundler) can't resolve — same reason
 * `generate-mock-catalog.ts` writes them via string manipulation instead of
 * importing + re-serializing.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

let failures = 0;
function fail(message: string) {
  failures += 1;
  console.error(`✗ ${message}`);
}
function ok(message: string) {
  console.log(`✓ ${message}`);
}

// --- Strip `//` line comments, but only outside of string literals — a
// naive `line.replace(/\/\/.*$/, "")` would truncate real values containing
// "//" (e.g. `"https://www.instagram.com/"`), and a stray apostrophe inside
// a comment (e.g. "the teacher's real Instagram URL") would desync a
// string-aware brace scanner if comments aren't stripped first. ---
function stripCommentsAware(text: string): string {
  let result = "";
  let inString: string | null = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      result += ch;
      if (ch === inString && text[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      result += ch;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      result += "\n";
      continue;
    }
    result += ch;
  }
  return result;
}

// --- Split a `export const NAME: Type[] = [ ... ];` array literal (with
// comments already stripped) into the source text of each top-level
// `{ ... }` element, tolerant of nested braces/arrays/string contents. ---
function splitTopLevelObjects(arraySource: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let start = -1;
  let inString: string | null = null;
  for (let i = 0; i < arraySource.length; i += 1) {
    const ch = arraySource[i];
    const prev = arraySource[i - 1];
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(arraySource.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}

function extractArraySource(fileText: string, exportMarker: string): string {
  const startIdx = fileText.indexOf(exportMarker);
  if (startIdx === -1) throw new Error(`Marker not found: ${exportMarker}`);
  const closeMatch = /\r?\n\];\r?\n/.exec(fileText.slice(startIdx));
  if (!closeMatch) throw new Error(`Closing "];" not found after: ${exportMarker}`);
  return fileText.slice(startIdx, startIdx + closeMatch.index + closeMatch[0].length);
}

function field(objSource: string, name: string): string | null {
  const m = new RegExp(`\\b${name}:\\s*"([^"]*)"`).exec(objSource);
  return m ? m[1] : null;
}

function numberField(objSource: string, name: string): number | null {
  const m = new RegExp(`\\b${name}:\\s*(-?\\d+(?:\\.\\d+)?)`).exec(objSource);
  return m ? Number(m[1]) : null;
}

function stringArrayField(objSource: string, name: string): string[] {
  const m = new RegExp(`\\b${name}:\\s*\\[([^\\]]*)\\]`).exec(objSource);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

interface MockRoutine {
  slug: string;
  title: string;
  instructorSlug: string;
  level: string;
  style: string;
  tags: string[];
  songName: string;
  artist: string;
  bpm: string;
  length: string;
  poster: string;
  priceOriginal: number;
  priceEarlyBird: number;
  chapters: { id: string; time: number }[];
}

function parseChapters(objSource: string): { id: string; time: number }[] {
  const m = /chapters:\s*\[([\s\S]*?)\n\s*\],/.exec(objSource);
  if (!m) return [];
  const chapters: { id: string; time: number }[] = [];
  const chapterRe = /\{\s*id:\s*"([^"]+)",\s*time:\s*(\d+)\s*\}/g;
  let cm;
  while ((cm = chapterRe.exec(m[1]))) {
    chapters.push({ id: cm[1], time: Number(cm[2]) });
  }
  return chapters;
}

function parseMockRoutines(): MockRoutine[] {
  const text = stripCommentsAware(
    fs.readFileSync(path.join(ROOT, "lib", "routines.ts"), "utf8"),
  );
  const arraySource = extractArraySource(text, "export const ROUTINES: RoutineRecord[] = [");
  return splitTopLevelObjects(arraySource).map((objSource) => {
    const pricingMatch = /pricing:\s*\{([\s\S]*?)\}/.exec(objSource);
    const pricingSource = pricingMatch ? pricingMatch[1] : "";
    return {
      slug: field(objSource, "slug") ?? "",
      title: field(objSource, "title") ?? "",
      instructorSlug: field(objSource, "instructorSlug") ?? "",
      level: field(objSource, "level") ?? "",
      style: field(objSource, "style") ?? "",
      tags: stringArrayField(objSource, "tags"),
      songName: field(objSource, "songName") ?? "",
      artist: field(objSource, "artist") ?? "",
      bpm: field(objSource, "bpm") ?? "",
      length: field(objSource, "length") ?? "",
      poster: field(objSource, "poster") ?? "",
      priceOriginal: numberField(pricingSource, "original") ?? NaN,
      priceEarlyBird: numberField(pricingSource, "earlyBird") ?? NaN,
      chapters: parseChapters(objSource),
    };
  });
}

interface MockInstructor {
  slug: string;
  style: string;
  avatar: string;
  instagramUrl: string;
}

function parseMockInstructors(): MockInstructor[] {
  const text = stripCommentsAware(
    fs.readFileSync(path.join(ROOT, "lib", "instructors.ts"), "utf8"),
  );
  const arraySource = extractArraySource(text, "export const INSTRUCTORS: InstructorRecord[] = [");
  return splitTopLevelObjects(arraySource).map((objSource) => {
    return {
      slug: field(objSource, "slug") ?? "",
      style: field(objSource, "style") ?? "",
      avatar: field(objSource, "avatar") ?? "",
      instagramUrl: field(objSource, "instagramUrl") ?? "",
    };
  });
}

interface MockContent {
  styles: Record<string, string>;
  routines: Record<string, { technique: string; description: string }>;
  instructors: Record<string, { name: string; bio: string }>;
}

function loadMockContent(locale: "he" | "en"): MockContent {
  const p = path.join(ROOT, "mocks", "content", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// --- D1 (local) queries ------------------------------------------------

function runD1<T>(sql: string): T[] {
  const escaped = sql.replace(/"/g, '\\"');
  const out = execSync(
    `npx wrangler d1 execute the-frame-catalog --local --json --command "${escaped}"`,
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024, cwd: ROOT },
  );
  // wrangler prints only JSON with --json, but guard against stray npm/wrangler
  // banner lines some environments still emit on stdout.
  const jsonStart = out.indexOf("[");
  const parsed = JSON.parse(out.slice(jsonStart));
  return parsed[0].results as T[];
}

interface DbRoutine {
  slug: string;
  title: string;
  song_name: string;
  artist: string;
  instructor_slug: string;
  level: string;
  style: string;
  tags_json: string;
  bpm: string;
  length: string;
  poster: string;
  price_original: number;
  price_early_bird: number;
}

interface DbInstructor {
  slug: string;
  style: string;
  avatar: string;
  instagram_url: string;
}

interface DbRoutineI18n {
  slug: string;
  locale: string;
  technique: string;
  description: string;
}

interface DbInstructorI18n {
  slug: string;
  locale: string;
  name: string;
  bio: string;
}

interface DbStyleI18n {
  style_key: string;
  locale: string;
  label: string;
}

interface DbChapter {
  routine_slug: string;
  chapter_id: string;
  time_seconds: number;
}

function main() {
  console.log("Checking local D1 has been migrated (npm run db:migrate:local)...");
  let dbRoutines: DbRoutine[];
  try {
    dbRoutines = runD1<DbRoutine>(
      "SELECT slug, title, song_name, artist, instructor_slug, level, style, tags_json, bpm, length, poster, price_original, price_early_bird FROM routines ORDER BY slug",
    );
  } catch (error) {
    console.error(
      "Could not read local D1 (run `npm run db:migrate:local` first). Underlying error:",
    );
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const dbInstructors = runD1<DbInstructor>(
    "SELECT slug, style, avatar, instagram_url FROM instructors ORDER BY slug",
  );
  const dbRoutineI18n = runD1<DbRoutineI18n>(
    "SELECT slug, locale, technique, description FROM routine_i18n",
  );
  const dbInstructorI18n = runD1<DbInstructorI18n>(
    "SELECT slug, locale, name, bio FROM instructor_i18n",
  );
  const dbStyleI18n = runD1<DbStyleI18n>("SELECT style_key, locale, label FROM style_i18n");
  const dbChapters = runD1<DbChapter>(
    "SELECT routine_slug, chapter_id, time_seconds FROM routine_chapters ORDER BY routine_slug, sort_order",
  );

  const mockRoutines = parseMockRoutines();
  const mockInstructors = parseMockInstructors();
  const mockHe = loadMockContent("he");
  const mockEn = loadMockContent("en");

  console.log(
    `Mock: ${mockRoutines.length} routines, ${mockInstructors.length} instructors.`,
  );
  console.log(
    `D1:   ${dbRoutines.length} routines, ${dbInstructors.length} instructors.`,
  );

  // --- Routine core fields + tags ---
  const dbRoutineBySlug = new Map(dbRoutines.map((r) => [r.slug, r]));
  const mockRoutineSlugs = new Set(mockRoutines.map((r) => r.slug));
  const dbRoutineSlugs = new Set(dbRoutines.map((r) => r.slug));

  for (const slug of mockRoutineSlugs) {
    if (!dbRoutineSlugs.has(slug)) fail(`Routine "${slug}" exists in mocks but not in D1`);
  }
  for (const slug of dbRoutineSlugs) {
    if (!mockRoutineSlugs.has(slug)) fail(`Routine "${slug}" exists in D1 but not in mocks`);
  }

  for (const mock of mockRoutines) {
    const db = dbRoutineBySlug.get(mock.slug);
    if (!db) continue;
    const dbTags: string[] = JSON.parse(db.tags_json);
    const checks: [string, unknown, unknown][] = [
      ["title", mock.title, db.title],
      ["songName", mock.songName, db.song_name],
      ["artist", mock.artist, db.artist],
      ["instructorSlug", mock.instructorSlug, db.instructor_slug],
      ["level", mock.level, db.level],
      ["style", mock.style, db.style],
      ["bpm", mock.bpm, db.bpm],
      ["length", mock.length, db.length],
      ["poster", mock.poster, db.poster],
      ["pricing.original", mock.priceOriginal, db.price_original],
      ["pricing.earlyBird", mock.priceEarlyBird, db.price_early_bird],
      ["tags", JSON.stringify(mock.tags), JSON.stringify(dbTags)],
    ];
    for (const [field_, mockVal, dbVal] of checks) {
      if (mockVal !== dbVal) {
        fail(`Routine "${mock.slug}" field ${field_}: mock=${JSON.stringify(mockVal)} db=${JSON.stringify(dbVal)}`);
      }
    }

    const dbRoutineChapters = dbChapters
      .filter((c) => c.routine_slug === mock.slug)
      .map((c) => ({ id: c.chapter_id, time: c.time_seconds }));
    if (JSON.stringify(mock.chapters) !== JSON.stringify(dbRoutineChapters)) {
      fail(
        `Routine "${mock.slug}" chapters differ: mock=${JSON.stringify(mock.chapters)} db=${JSON.stringify(dbRoutineChapters)}`,
      );
    }
  }

  // --- Instructor core fields ---
  const dbInstructorBySlug = new Map(dbInstructors.map((i) => [i.slug, i]));
  const mockInstructorSlugs = new Set(mockInstructors.map((i) => i.slug));
  const dbInstructorSlugs = new Set(dbInstructors.map((i) => i.slug));

  for (const slug of mockInstructorSlugs) {
    if (!dbInstructorSlugs.has(slug)) fail(`Instructor "${slug}" exists in mocks but not in D1`);
  }
  for (const slug of dbInstructorSlugs) {
    if (!mockInstructorSlugs.has(slug)) fail(`Instructor "${slug}" exists in D1 but not in mocks`);
  }
  for (const mock of mockInstructors) {
    const db = dbInstructorBySlug.get(mock.slug);
    if (!db) continue;
    if (mock.style !== db.style) fail(`Instructor "${mock.slug}" style: mock=${mock.style} db=${db.style}`);
    if (mock.avatar !== db.avatar) fail(`Instructor "${mock.slug}" avatar: mock=${mock.avatar} db=${db.avatar}`);
    if (mock.instagramUrl !== db.instagram_url)
      fail(`Instructor "${mock.slug}" instagramUrl: mock=${mock.instagramUrl} db=${db.instagram_url}`);
  }

  // --- i18n content (mocks/content/*.json vs routine_i18n / instructor_i18n / style_i18n) ---
  function checkI18n(
    locale: "he" | "en",
    mockContent: MockContent,
    dbRoutineRows: DbRoutineI18n[],
    dbInstructorRows: DbInstructorI18n[],
    dbStyleRows: DbStyleI18n[],
  ) {
    const routineRows = dbRoutineRows.filter((r) => r.locale === locale);
    const dbRoutineMap = new Map(routineRows.map((r) => [r.slug, r]));
    for (const [slug, content] of Object.entries(mockContent.routines)) {
      const db = dbRoutineMap.get(slug);
      if (!db) {
        fail(`[${locale}] routine i18n "${slug}" exists in mocks/content but not in D1 routine_i18n`);
        continue;
      }
      if (content.technique !== db.technique)
        fail(`[${locale}] routine "${slug}" technique differs between mocks/content and D1`);
      if (content.description !== db.description)
        fail(`[${locale}] routine "${slug}" description differs between mocks/content and D1`);
    }
    for (const slug of dbRoutineMap.keys()) {
      if (!(slug in mockContent.routines)) {
        fail(`[${locale}] routine i18n "${slug}" exists in D1 but not in mocks/content`);
      }
    }

    const instructorRows = dbInstructorRows.filter((r) => r.locale === locale);
    const dbInstructorMap = new Map(instructorRows.map((r) => [r.slug, r]));
    for (const [slug, content] of Object.entries(mockContent.instructors)) {
      const db = dbInstructorMap.get(slug);
      if (!db) {
        fail(`[${locale}] instructor i18n "${slug}" exists in mocks/content but not in D1 instructor_i18n`);
        continue;
      }
      if (content.name !== db.name)
        fail(`[${locale}] instructor "${slug}" name differs between mocks/content and D1`);
      if (content.bio !== db.bio)
        fail(`[${locale}] instructor "${slug}" bio differs between mocks/content and D1`);
    }
    for (const slug of dbInstructorMap.keys()) {
      if (!(slug in mockContent.instructors)) {
        fail(`[${locale}] instructor i18n "${slug}" exists in D1 but not in mocks/content`);
      }
    }

    const styleRows = dbStyleRows.filter((r) => r.locale === locale);
    const dbStyleMap = new Map(styleRows.map((r) => [r.style_key, r.label]));
    for (const [styleKey, label] of Object.entries(mockContent.styles)) {
      const dbLabel = dbStyleMap.get(styleKey);
      if (dbLabel === undefined) {
        fail(`[${locale}] style "${styleKey}" exists in mocks/content but not in D1 style_i18n`);
      } else if (dbLabel !== label) {
        fail(`[${locale}] style "${styleKey}" label differs: mock=${label} db=${dbLabel}`);
      }
    }
    for (const styleKey of dbStyleMap.keys()) {
      if (!(styleKey in mockContent.styles)) {
        fail(`[${locale}] style "${styleKey}" exists in D1 but not in mocks/content`);
      }
    }
  }

  checkI18n("he", mockHe, dbRoutineI18n, dbInstructorI18n, dbStyleI18n);
  checkI18n("en", mockEn, dbRoutineI18n, dbInstructorI18n, dbStyleI18n);

  if (failures === 0) {
    ok(
      `Mocks and local D1 are in parity (${mockRoutines.length} routines, ${mockInstructors.length} instructors, 2 locales).`,
    );
    process.exit(0);
  } else {
    console.error(`\n${failures} parity issue(s) found between mocks and local D1.`);
    console.error(
      "Fix by either updating lib/routines.ts / lib/instructors.ts / mocks/content/*.json to match D1, or adding a migration if D1 is the one that's wrong.",
    );
    process.exit(1);
  }
}

main();
