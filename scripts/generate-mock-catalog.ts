/**
 * One-off deterministic generator that scales the mock catalog from a handful
 * of curated rows to ~100 routines / 18 instructors, and seeds demo users +
 * purchases into D1. Re-running is idempotent for the generated *sections*
 * (it only rewrites the parts it owns) but this is meant to be run once and
 * committed — treat the output as the new source of truth, not the script.
 *
 * Usage: node scripts/generate-mock-catalog.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TEACHER_NAME_BANK,
  SONG_NAME_BANK,
  type SongSeed,
} from "../mocks/name-bank.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

type StyleKey =
  | "jazz-funk"
  | "hip-hop"
  | "heels"
  | "jazz"
  | "afro"
  | "dancehall"
  | "commercial";
type LevelKey = "beginner" | "intermediate" | "advanced" | "all-levels";
type Gender = "f" | "m";

const LEVELS: LevelKey[] = ["beginner", "intermediate", "advanced", "all-levels"];
const TECHNIQUE_TAGS = ["performance", "groove", "musicality", "body-control"] as const;

const SAMPLE_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

/** Existing curated instructor per style — reused as one of that style's teachers below. */
const EXISTING_INSTRUCTOR_BY_STYLE: Record<string, string> = {
  "jazz-funk": "maya-azulai",
  "hip-hop": "daniel-cohen",
  heels: "noa-sagi",
};

/**
 * 4 distinct cover photos per style (not just one shared per style — see
 * scripts/assign-routine-covers.mjs, which fixed the initial ~14-15x repeat
 * this produced). Each routine picks a pool entry deterministically from a
 * hash of its slug, so re-running this generator would no longer collapse
 * an entire style onto one repeated stock photo.
 */
const POSTER_POOL_BY_STYLE: Record<StyleKey, string[]> = {
  "jazz-funk": [
    "/routine-posters/routine-poster-midnight-static.png",
    "/routine-posters/routine-poster-concrete-groove.png",
    "/routine-posters/routine-poster-amber-loft.png",
    "/routine-posters/routine-poster-city-lights-funk.png",
  ],
  "hip-hop": [
    "/routine-posters/routine-poster-neon-nights.png",
    "/routine-posters/routine-poster-street-cypher.png",
    "/routine-posters/routine-poster-warehouse-glow.png",
    "/routine-posters/routine-poster-block-party.png",
  ],
  heels: [
    "/routine-posters/routine-poster-velvet-heels.png",
    "/routine-posters/routine-poster-neon-runway.png",
    "/routine-posters/routine-poster-penthouse-heels.png",
    "/routine-posters/routine-poster-city-glam.png",
  ],
  jazz: [
    "/routine-posters/routine-poster-jazz-glow.png",
    "/routine-posters/routine-poster-spotlight-lyrical.png",
    "/routine-posters/routine-poster-amber-stage.png",
    "/routine-posters/routine-poster-velvet-curtain.png",
  ],
  afro: [
    "/routine-posters/routine-poster-afro-sunburst.png",
    "/routine-posters/routine-poster-afro-rhythm.png",
    "/routine-posters/routine-poster-tribal-energy.png",
    "/routine-posters/routine-poster-afro-groove.png",
  ],
  dancehall: [
    "/routine-posters/routine-poster-dancehall-block.png",
    "/routine-posters/routine-poster-dancehall-bounce.png",
    "/routine-posters/routine-poster-carnival-vibes.png",
    "/routine-posters/routine-poster-island-heat.png",
  ],
  // "commercial" was renamed to "voguing" post-launch (migrations/0010) —
  // its pool already uses the renamed voguing filenames.
  commercial: [
    "/routine-posters/routine-poster-voguing-spotlight.png",
    "/routine-posters/routine-poster-ballroom-runway.png",
    "/routine-posters/routine-poster-vogue-glam.png",
    "/routine-posters/routine-poster-house-of-style.png",
  ],
};

/** Stable djb2 string hash — deterministic per slug, not RNG-based. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function coverForRoutine(slug: string, style: StyleKey): string {
  const pool = POSTER_POOL_BY_STYLE[style];
  return pool[hashString(slug) % pool.length];
}

/** How many *new* instructors to pick from the name bank, per style (existing 3 add +1 each). */
const NEW_INSTRUCTOR_COUNT_BY_STYLE: Record<StyleKey, number> = {
  "jazz-funk": 2,
  "hip-hop": 2,
  heels: 2,
  jazz: 3,
  afro: 2,
  dancehall: 2,
  commercial: 2,
};

/** How many new routines to generate per style (97 total). */
const ROUTINE_COUNT_BY_STYLE: Record<StyleKey, number> = {
  "jazz-funk": 14,
  "hip-hop": 14,
  heels: 14,
  jazz: 14,
  afro: 14,
  dancehall: 14,
  commercial: 13,
};

/** Known genders for new instructors, used to pick correct Hebrew verb forms in bios. */
const GENDER_BY_SLUG: Record<string, Gender> = {
  "tali-mizrahi": "f",
  "yael-bar": "f",
  "oran-ben-david": "m",
  "amit-sharabi": "m",
  "maya-rozin": "f",
  "noga-eliyahu": "f",
  "yasmin-kadosh": "f",
  "omer-tzur": "m",
  "hila-ben-ari": "f",
  "efrat-wolde": "f",
  "yonatan-tesfaye": "m",
  "or-katz": "m",
  "tamir-levy": "m",
  "michal-buzaglo": "f",
  "guy-ravid": "m",
};

const STYLE_LABEL_HE: Record<StyleKey, string> = {
  "jazz-funk": "ג'אז פאנק",
  "hip-hop": "היפ הופ",
  heels: "עקבים",
  jazz: "ג'אז",
  afro: "אפרו",
  dancehall: "דאנסהול",
  commercial: "קומרשיאל",
};

const STYLE_LABEL_EN: Record<StyleKey, string> = {
  "jazz-funk": "Jazz Funk",
  "hip-hop": "Hip Hop",
  heels: "Heels",
  jazz: "Jazz",
  afro: "Afro",
  dancehall: "Dancehall",
  commercial: "Commercial",
};

interface GeneratedInstructor {
  slug: string;
  name: string;
  nameEn: string;
  style: StyleKey;
  avatar: string;
  instagramUrl: string;
  bioHe: string;
  bioEn: string;
}

/** Slugs are already Latin transliterations — title-case them for the English locale. */
function slugToEnglishName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface GeneratedRoutine {
  slug: string;
  title: string;
  instructorSlug: string;
  level: LevelKey;
  style: StyleKey;
  tags: string[];
  songName: string;
  artist: string;
  bpm: string;
  length: string;
  poster: string;
  videoSrc: string;
  chapters: { id: string; time: number }[];
  checkoutHref: string;
  pricing: { original: number; earlyBird: number };
  techniqueHe: string;
  descriptionHe: string;
  techniqueEn: string;
  descriptionEn: string;
}

function lengthToSeconds(length: string): number {
  const [min, sec] = length.split(":").map(Number);
  return min * 60 + sec;
}

function buildChapters(length: string) {
  const total = lengthToSeconds(length);
  const breakdown = Math.max(8, Math.round(total * 0.12));
  const slow = Math.max(breakdown + 12, Math.round(total * 0.32));
  const fullSpeed = Math.max(slow + 12, Math.round(total * 0.58));
  return [
    { id: "full-performance", time: 0 },
    { id: "breakdown", time: breakdown },
    { id: "slow-practice", time: Math.min(slow, total - 10) },
    { id: "full-speed", time: Math.min(fullSpeed, total - 4) },
  ];
}

const BIO_TRAITS_HE: Record<StyleKey, string[]> = {
  "jazz-funk": ["גרוב ופרפורמנס", "מעברי משקל ושליטה בקצב", "ביטוי אישי על הבמה"],
  "hip-hop": ["גרוב, מוזיקליות ופירוק שיטתי", "עבודת רצפה וקואורדינציה", "פוליריתמיקה וסטייל אישי"],
  heels: ["שליטה בעקב, אורך קו ופרפורמנס", "יציבה ותנועתיות בעקב", "ביטחון וגרייס על הבמה"],
  jazz: ["טכניקה, קו ומוזיקליות", "ליריקה ועומק רגשי בתנועה", "שליטה בגוף ופרפורמנס"],
  afro: ["איזולציות, גרוב ואנרגייה", "קצב אפריקאי אותנטי וקהילתיות", "תנועתיות חופשית ושמחה"],
  dancehall: ["בונס, גרוב ואטיטיוד", "עוצמה ודיוק בתנועה", "אנרגייה גבוהה וסטייל רחוב"],
  commercial: ["פרפורמנס וסטייל מסחרי", "שילוב טכניקה עם ביטחון על הבמה", "קלינות תנועה וקצב מדויק"],
};

const BIO_TRAITS_EN: Record<StyleKey, string[]> = {
  "jazz-funk": ["groove and performance", "weight shifts and rhythm control", "personal stage expression"],
  "hip-hop": ["groove, musicality, and systematic breakdown", "floorwork and coordination", "polyrhythm and personal style"],
  heels: ["heel control, line, and performance", "posture and heel mobility", "confidence and stage grace"],
  jazz: ["technique, line, and musicality", "lyrical depth in movement", "body control and performance"],
  afro: ["isolations, groove, and energy", "authentic African rhythm and community", "free movement and joy"],
  dancehall: ["bounce, groove, and attitude", "power and precision in movement", "high energy and street style"],
  commercial: ["performance and commercial style", "blending technique with stage confidence", "sharp movement and precise timing"],
};

const TECHNIQUE_TEMPLATES_HE: Record<StyleKey, string[]> = {
  "jazz-funk": ["מעברי משקל קרקעיים ופרפורמנס", "גרוב, איזולציות ודיוק תנועה", "קצב, ליין ואנרגיית ביצוע"],
  "hip-hop": ["גרוב, פוליריתמיקה ועבודת רצפה", "פירוק שיטתי וקואורדינציה", "עוצמה, גרוב וסטייל אישי"],
  heels: ["אורך קו, שליטה בעקב ופרפורמנס", "יציבה, בטחון ותנועתיות בעקב", "גרייס וקונטרול על הבמה"],
  jazz: ["טכניקה, קו ועומק רגשי", "מוזיקליות ושליטה בגוף", "ליריקה ופרפורמנס"],
  afro: ["איזולציות, גרוב ואנרגייה קבוצתית", "קצב אפריקאי אותנטי ותנועתיות חופשית", "שליחת אנרגייה ושמחת תנועה"],
  dancehall: ["בונס, גרוב ואטיטיוד", "עוצמה ודיוק בתנועות רגליים", "אנרגייה גבוהה וסטייל רחוב"],
  commercial: ["פרפורמנס וסטייל מסחרי חד", "שילוב טכניקה עם ביטחון על הבמה", "קלינות תנועה וטיימינג מדויק"],
};

const TECHNIQUE_TEMPLATES_EN: Record<StyleKey, string[]> = {
  "jazz-funk": ["Grounded weight shifts and performance", "Groove, isolations, and movement precision", "Rhythm, line, and performance energy"],
  "hip-hop": ["Groove, polyrhythm, and floorwork", "Systematic breakdown and coordination", "Power, groove, and personal style"],
  heels: ["Line, heel control, and performance", "Posture, confidence, and heel mobility", "Grace and control on stage"],
  jazz: ["Technique, line, and emotional depth", "Musicality and body control", "Lyricism and performance"],
  afro: ["Isolations, groove, and group energy", "Authentic African rhythm and free movement", "Sending energy and movement joy"],
  dancehall: ["Bounce, groove, and attitude", "Power and precision in footwork", "High energy and street style"],
  commercial: ["Sharp performance and commercial style", "Blending technique with stage confidence", "Clean movement and precise timing"],
};

const DESCRIPTION_TEMPLATES_HE: Record<StyleKey, (song: SongSeed, styleLabel: string) => string[]> = {
  "jazz-funk": (song, s) => [
    `קומבינציית ${s} אנרגטית על "${song.title}" של ${song.artist}, עם דגש על גרוב ופרפורמנס — מושלמת לרקדנים שרוצים לשדרג את הביטוי האישי שלהם על הבמה.`,
    `שגרת ${s} קצבית ל"${song.title}" (${song.artist}), שמלמדת שליטה במעברי משקל ותנועה חלקה מבלי לוותר על אנרגייה.`,
  ],
  "hip-hop": (song, s) => [
    `קומבינציית ${s} עוצמתית ל"${song.title}" של ${song.artist}, שבנויה על גרוב עמוק ומעברים חדים בין התנועות.`,
    `שגרת ${s} עם דגש טכני גבוה ל"${song.title}" (${song.artist}) — לרקדנים שרוצים להעמיק בסגנון ובפירוק התנועות.`,
  ],
  heels: (song, s) => [
    `קומבינציית ${s} מפתה ובטוחה ל"${song.title}" של ${song.artist}, שמלמדת איך לשלוט בעקב מבלי לוותר על טכניקה.`,
    `שגרת ${s} עם דגשים על יציבה, אורך קו ופרפורמנס, ל"${song.title}" (${song.artist}).`,
  ],
  jazz: (song, s) => [
    `קומבינציית ${s} ליריקה ל"${song.title}" של ${song.artist}, עם דגש על עומק רגשי ומוזיקליות.`,
    `שגרת ${s} טכנית ל"${song.title}" (${song.artist}) — לרקדנים שרוצים לחדד קו וביטוי בגוף.`,
  ],
  afro: (song, s) => [
    `קומבינציית ${s} קצבית ל"${song.title}" של ${song.artist}, עם דגש על איזולציות ואנרגייה קבוצתית.`,
    `שגרת ${s} שמחה ל"${song.title}" (${song.artist}) — קצב אפריקאי אותנטי ותנועתיות חופשית.`,
  ],
  dancehall: (song, s) => [
    `קומבינציית ${s} עם בונס ואטיטיוד ל"${song.title}" של ${song.artist}, לרקדנים שרוצים סטייל רחוב אמיתי.`,
    `שגרת ${s} באנרגייה גבוהה ל"${song.title}" (${song.artist}) — עוצמה ודיוק בתנועות הרגליים.`,
  ],
  commercial: (song, s) => [
    `קומבינציית ${s} חדה ל"${song.title}" של ${song.artist}, שמשלבת טכניקה עם ביטחון על הבמה.`,
    `שגרת ${s} עם טיימינג מדויק ל"${song.title}" (${song.artist}) — סטייל מסחרי לביצועים ואודישנים.`,
  ],
};

const DESCRIPTION_TEMPLATES_EN: Record<StyleKey, (song: SongSeed, styleLabel: string) => string[]> = {
  "jazz-funk": (song, s) => [
    `An energetic ${s} combination to "${song.title}" by ${song.artist}, focused on groove and performance — ideal for dancers who want to sharpen their stage expression.`,
    `A rhythmic ${s} routine to "${song.title}" (${song.artist}), teaching smooth weight shifts without losing energy.`,
  ],
  "hip-hop": (song, s) => [
    `A powerful ${s} combination to "${song.title}" by ${song.artist}, built on deep groove and sharp transitions.`,
    `A ${s} routine with a high technical emphasis to "${song.title}" (${song.artist}) — for dancers who want to go deeper into the style.`,
  ],
  heels: (song, s) => [
    `A seductive, confident ${s} combination to "${song.title}" by ${song.artist}, teaching heel control without sacrificing technique.`,
    `A ${s} routine with an emphasis on posture, line, and performance, to "${song.title}" (${song.artist}).`,
  ],
  jazz: (song, s) => [
    `A lyrical ${s} combination to "${song.title}" by ${song.artist}, with an emphasis on emotional depth and musicality.`,
    `A technical ${s} routine to "${song.title}" (${song.artist}) — for dancers who want to sharpen line and physical expression.`,
  ],
  afro: (song, s) => [
    `A rhythmic ${s} combination to "${song.title}" by ${song.artist}, with an emphasis on isolations and group energy.`,
    `A joyful ${s} routine to "${song.title}" (${song.artist}) — authentic African rhythm and free movement.`,
  ],
  dancehall: (song, s) => [
    `A bouncy, attitude-filled ${s} combination to "${song.title}" by ${song.artist}, for dancers who want real street style.`,
    `A high-energy ${s} routine to "${song.title}" (${song.artist}) — power and precision in the footwork.`,
  ],
  commercial: (song, s) => [
    `A sharp ${s} combination to "${song.title}" by ${song.artist}, blending technique with stage confidence.`,
    `A ${s} routine with precise timing to "${song.title}" (${song.artist}) — commercial style for gigs and auditions.`,
  ],
};

function pickNewInstructors(): GeneratedInstructor[] {
  const chosen: GeneratedInstructor[] = [];
  const styles = Object.keys(NEW_INSTRUCTOR_COUNT_BY_STYLE) as StyleKey[];
  for (const style of styles) {
    const count = NEW_INSTRUCTOR_COUNT_BY_STYLE[style];
    const candidates = TEACHER_NAME_BANK.filter((t) => t.style === style).slice(0, count);
    for (const candidate of candidates) {
      const gender = GENDER_BY_SLUG[candidate.slug] ?? "f";
      const traitsHe = BIO_TRAITS_HE[style];
      const traitsEn = BIO_TRAITS_EN[style];
      const idx = chosen.length % traitsHe.length;
      const verbHe = gender === "f" ? "מלמדת" : "מלמד";
      chosen.push({
        slug: candidate.slug,
        name: candidate.name,
        nameEn: slugToEnglishName(candidate.slug),
        style,
        avatar: `/instructors/${candidate.slug}.jpg`,
        instagramUrl: "https://www.instagram.com/",
        bioHe: `${verbHe} ${STYLE_LABEL_HE[style]} — ${traitsHe[idx]}.`,
        bioEn: `Teaches ${STYLE_LABEL_EN[style]} — ${traitsEn[idx]}.`,
      });
    }
  }
  return chosen;
}

function instructorsForStyle(style: StyleKey, newInstructors: GeneratedInstructor[]): string[] {
  const existing = EXISTING_INSTRUCTOR_BY_STYLE[style];
  const generated = newInstructors.filter((i) => i.style === style).map((i) => i.slug);
  return existing ? [existing, ...generated] : generated;
}

function generateRoutines(newInstructors: GeneratedInstructor[]): GeneratedRoutine[] {
  const routines: GeneratedRoutine[] = [];
  const styles = Object.keys(ROUTINE_COUNT_BY_STYLE) as StyleKey[];

  for (const style of styles) {
    const count = ROUTINE_COUNT_BY_STYLE[style];
    const instructors = instructorsForStyle(style, newInstructors);
    // This script's local StyleKey (below) predates lib/routines.ts's final
    // DanceStyleKey set and still carries "commercial", which was dropped
    // before the catalog shipped — cast rather than widening the live
    // DanceStyleKey type just to satisfy this one-off, already-run script.
    const songs = SONG_NAME_BANK.filter((s) => (s.styles as string[]).includes(style));
    const styleLabelHe = STYLE_LABEL_HE[style];
    const styleLabelEn = STYLE_LABEL_EN[style];

    for (let i = 0; i < count; i += 1) {
      const song = songs[i % songs.length];
      const instructorSlug = instructors[i % instructors.length];
      const slug = `${song.slug}-${instructorSlug}`;
      const level = LEVELS[i % LEVELS.length];
      const secondaryTag = TECHNIQUE_TAGS[i % TECHNIQUE_TAGS.length];
      const tags = [style, secondaryTag];
      const priceOriginal = [49, 59, 69, 79][i % 4];
      const priceEarlyBird = priceOriginal - 20;

      const techniqueHe = TECHNIQUE_TEMPLATES_HE[style][i % TECHNIQUE_TEMPLATES_HE[style].length];
      const techniqueEn = TECHNIQUE_TEMPLATES_EN[style][i % TECHNIQUE_TEMPLATES_EN[style].length];
      const descOptionsHe = DESCRIPTION_TEMPLATES_HE[style](song, styleLabelHe);
      const descOptionsEn = DESCRIPTION_TEMPLATES_EN[style](song, styleLabelEn);

      routines.push({
        slug,
        title: song.title,
        instructorSlug,
        level,
        style,
        tags,
        songName: song.title,
        artist: song.artist,
        bpm: `${song.bpm} BPM`,
        length: song.length,
        poster: coverForRoutine(slug, style),
        videoSrc: SAMPLE_VIDEO_SRC,
        chapters: buildChapters(song.length),
        checkoutHref: `/checkout/${slug}`,
        pricing: { original: priceOriginal, earlyBird: priceEarlyBird },
        techniqueHe,
        descriptionHe: descOptionsHe[i % descOptionsHe.length],
        techniqueEn,
        descriptionEn: descOptionsEn[i % descOptionsEn.length],
      });
    }
  }

  return routines;
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

function routineToTs(r: GeneratedRoutine): string {
  const chapters = r.chapters
    .map((c) => `      { id: ${tsString(c.id)}, time: ${c.time} },`)
    .join("\n");
  const tags = r.tags.map(tsString).join(", ");
  return `  {
    slug: ${tsString(r.slug)},
    title: ${tsString(r.title)},
    instructorSlug: ${tsString(r.instructorSlug)},
    level: ${tsString(r.level)},
    style: ${tsString(r.style)},
    tags: [${tags}],
    songName: ${tsString(r.songName)},
    artist: ${tsString(r.artist)},
    bpm: ${tsString(r.bpm)},
    length: ${tsString(r.length)},
    poster: ${tsString(r.poster)},
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
${chapters}
    ],
    checkoutHref: ${tsString(r.checkoutHref)},
    pricing: {
      original: ${r.pricing.original},
      earlyBird: ${r.pricing.earlyBird},
    },
  },`;
}

function instructorToTs(i: GeneratedInstructor): string {
  return `  {
    slug: ${tsString(i.slug)},
    style: ${tsString(i.style)},
    avatar: ${tsString(i.avatar)},
    instagramUrl: ${tsString(i.instagramUrl)},
  },`;
}

function insertBeforeArrayClose(content: string, marker: string, entriesText: string): string {
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) {
    throw new Error(`Marker not found: ${marker}`);
  }
  const closeMatch = /\r?\n\];\r?\n/.exec(content.slice(startIdx));
  if (!closeMatch) {
    throw new Error(`Closing "];" not found after marker: ${marker}`);
  }
  const closeIdx = startIdx + closeMatch.index;
  const newline = closeMatch[0].startsWith("\r\n") ? "\r\n" : "\n";
  const entriesWithNewline = entriesText.replace(/\n/g, newline);
  return `${content.slice(0, closeIdx)}${newline}${entriesWithNewline}${content.slice(closeIdx)}`;
}

function writeRoutinesTs(routines: GeneratedRoutine[]) {
  const filePath = path.join(ROOT, "lib", "routines.ts");
  const content = fs.readFileSync(filePath, "utf8");
  const entries = routines.map(routineToTs).join("\n");
  const updated = insertBeforeArrayClose(
    content,
    "export const ROUTINES: RoutineRecord[] = [",
    entries,
  );
  fs.writeFileSync(filePath, updated);
}

function writeInstructorsTs(instructors: GeneratedInstructor[]) {
  const filePath = path.join(ROOT, "lib", "instructors.ts");
  const content = fs.readFileSync(filePath, "utf8");
  const entries = instructors.map(instructorToTs).join("\n");
  const updated = insertBeforeArrayClose(
    content,
    "export const INSTRUCTORS: InstructorRecord[] = [",
    entries,
  );
  fs.writeFileSync(filePath, updated);
}

function writeMockContent(
  routines: GeneratedRoutine[],
  instructors: GeneratedInstructor[],
) {
  const hePath = path.join(ROOT, "mocks", "content", "he.json");
  const enPath = path.join(ROOT, "mocks", "content", "en.json");
  const he = JSON.parse(fs.readFileSync(hePath, "utf8"));
  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

  for (const style of Object.keys(STYLE_LABEL_HE) as StyleKey[]) {
    he.styles[style] = STYLE_LABEL_HE[style];
    en.styles[style] = STYLE_LABEL_EN[style];
  }

  for (const r of routines) {
    he.routines[r.slug] = { technique: r.techniqueHe, description: r.descriptionHe };
    en.routines[r.slug] = { technique: r.techniqueEn, description: r.descriptionEn };
  }

  for (const i of instructors) {
    he.instructors[i.slug] = { name: i.name, bio: i.bioHe };
    en.instructors[i.slug] = { name: i.nameEn, bio: i.bioEn };
  }

  fs.writeFileSync(hePath, `${JSON.stringify(he, null, 2)}\n`);
  fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function writeCatalogSeedMigration(
  routines: GeneratedRoutine[],
  instructors: GeneratedInstructor[],
) {
  const lines: string[] = [];
  lines.push(
    "-- Additive seed: expands the mock catalog to ~100 routines / 18 instructors across 4 new styles.",
    "-- Never edit 0002_catalog_seed.sql (already applied) — new catalog rows are appended here instead.",
    "",
    "-- New style labels",
    "INSERT INTO style_i18n (style_key, locale, label) VALUES",
  );
  const newStyles = ["jazz", "afro", "dancehall", "commercial"] as StyleKey[];
  const styleRows: string[] = [];
  for (const style of newStyles) {
    styleRows.push(`  (${sqlString(style)}, 'he', ${sqlString(STYLE_LABEL_HE[style])})`);
  }
  for (const style of newStyles) {
    styleRows.push(`  (${sqlString(style)}, 'en', ${sqlString(STYLE_LABEL_EN[style])})`);
  }
  lines.push(`${styleRows.join(",\n")};`, "");

  lines.push("-- New instructors", "INSERT INTO instructors (slug, style, avatar, instagram_url) VALUES");
  lines.push(
    `${instructors
      .map(
        (i) =>
          `  (${sqlString(i.slug)}, ${sqlString(i.style)}, ${sqlString(i.avatar)}, ${sqlString(i.instagramUrl)})`,
      )
      .join(",\n")};`,
    "",
  );

  lines.push("INSERT INTO instructor_i18n (slug, locale, name, bio) VALUES");
  const instructorI18nRows: string[] = [];
  for (const i of instructors) {
    instructorI18nRows.push(`  (${sqlString(i.slug)}, 'he', ${sqlString(i.name)}, ${sqlString(i.bioHe)})`);
  }
  for (const i of instructors) {
    instructorI18nRows.push(`  (${sqlString(i.slug)}, 'en', ${sqlString(i.nameEn)}, ${sqlString(i.bioEn)})`);
  }
  lines.push(`${instructorI18nRows.join(",\n")};`, "");

  lines.push(
    "-- New routines",
    "INSERT INTO routines (",
    "  slug, title, song_name, artist, instructor_slug, level, style, tags_json,",
    "  bpm, length, poster, video_src, price_original, price_early_bird",
    ") VALUES",
  );
  const routineRows = routines.map((r) => {
    const tagsJson = sqlString(JSON.stringify(r.tags));
    return `  (
    ${sqlString(r.slug)}, ${sqlString(r.title)}, ${sqlString(r.songName)}, ${sqlString(r.artist)}, ${sqlString(r.instructorSlug)},
    ${sqlString(r.level)}, ${sqlString(r.style)}, ${tagsJson},
    ${sqlString(r.bpm)}, ${sqlString(r.length)}, ${sqlString(r.poster)},
    ${sqlString(r.videoSrc)},
    ${r.pricing.original}, ${r.pricing.earlyBird}
  )`;
  });
  lines.push(`${routineRows.join(",\n")};`, "");

  lines.push("INSERT INTO routine_i18n (slug, locale, technique, description) VALUES");
  const routineI18nRows: string[] = [];
  for (const r of routines) {
    routineI18nRows.push(
      `  (${sqlString(r.slug)}, 'he', ${sqlString(r.techniqueHe)}, ${sqlString(r.descriptionHe)})`,
    );
  }
  for (const r of routines) {
    routineI18nRows.push(
      `  (${sqlString(r.slug)}, 'en', ${sqlString(r.techniqueEn)}, ${sqlString(r.descriptionEn)})`,
    );
  }
  lines.push(`${routineI18nRows.join(",\n")};`, "");

  lines.push(
    "INSERT INTO routine_chapters (routine_slug, chapter_id, time_seconds, sort_order) VALUES",
  );
  const chapterRows: string[] = [];
  for (const r of routines) {
    r.chapters.forEach((c, idx) => {
      chapterRows.push(`  (${sqlString(r.slug)}, ${sqlString(c.id)}, ${c.time}, ${idx})`);
    });
  }
  lines.push(`${chapterRows.join(",\n")};`, "");

  const filePath = path.join(ROOT, "migrations", "0007_catalog_seed_expansion.sql");
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

// --- Demo users + purchases -------------------------------------------------

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "נועה", "יובל", "עומר", "מאיה", "איתי", "שירה", "דניאל", "הילה", "אור", "רותם",
  "גל", "ליה", "אדם", "טליה", "עידן", "נטע", "רועי", "אביגיל", "בר", "אלה",
  "יונתן", "שני", "תומר", "מיכל", "ניצן", "עדי", "אריאל", "קרן", "אלון", "ורד",
];
const LAST_NAMES = [
  "כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אזולאי", "דהן", "אשכנזי", "בן דוד", "וקנין",
  "שרעבי", "מלכה", "רוזין", "אליהו", "סבג", "עמר", "אוחיון", "גבאי", "חדד", "אסייג",
];

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

interface DemoUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  localePref: "he" | "en";
  createdAt: string;
  lastLoginAt: string;
}

const REFERENCE_DATE = new Date("2026-08-11T09:00:00Z");

function daysAgo(days: number): string {
  const d = new Date(REFERENCE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function generateUsers(count: number, rand: () => number): DemoUser[] {
  const users: DemoUser[] = [];
  for (let i = 1; i <= count; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const createdDaysAgo = Math.round(rand() * 180) + 1;
    const lastLoginDaysAgo = Math.max(0, createdDaysAgo - Math.round(rand() * createdDaysAgo));
    users.push({
      firebaseUid: `demo-user-${pad4(i)}`,
      email: `demo.user.${pad4(i)}@example.com`,
      displayName: `${first} ${last}`,
      localePref: rand() < 0.8 ? "he" : "en",
      createdAt: daysAgo(createdDaysAgo),
      lastLoginAt: daysAgo(lastLoginDaysAgo),
    });
  }
  return users;
}

interface DemoPurchase {
  id: string;
  firebaseUid: string;
  routineSlug: string;
  status: "paid" | "pending" | "refunded";
  amountIls: number;
  createdAt: string;
  paidAt: string | null;
}

function generatePurchases(
  count: number,
  users: DemoUser[],
  allRoutines: { slug: string; pricing: { original: number; earlyBird: number } }[],
  rand: () => number,
): DemoPurchase[] {
  const purchases: DemoPurchase[] = [];
  const used = new Set<string>();
  let attempts = 0;
  let i = 1;
  while (purchases.length < count && attempts < count * 20) {
    attempts += 1;
    const user = users[Math.floor(rand() * users.length)];
    const routine = allRoutines[Math.floor(rand() * allRoutines.length)];
    const key = `${user.firebaseUid}:${routine.slug}`;
    if (used.has(key)) continue;

    const roll = rand();
    const status: DemoPurchase["status"] = roll < 0.85 ? "paid" : roll < 0.95 ? "pending" : "refunded";
    used.add(key);

    const createdDaysAgo = Math.round(rand() * 150) + 1;
    const paidDaysAgo = status === "paid" ? Math.max(0, createdDaysAgo - 1) : createdDaysAgo;

    purchases.push({
      id: `demo-purchase-${pad4(i)}`,
      firebaseUid: user.firebaseUid,
      routineSlug: routine.slug,
      status,
      amountIls: routine.pricing.earlyBird,
      createdAt: daysAgo(createdDaysAgo),
      paidAt: status === "paid" ? daysAgo(paidDaysAgo) : null,
    });
    i += 1;
  }
  return purchases;
}

function writeUsersPurchasesMigration(
  routines: GeneratedRoutine[],
  curatedRoutineSlugs: { slug: string; pricing: { original: number; earlyBird: number } }[],
) {
  const rand = mulberry32(20260811);
  const users = generateUsers(200, rand);
  const allRoutines = [
    ...curatedRoutineSlugs,
    ...routines.map((r) => ({ slug: r.slug, pricing: r.pricing })),
  ];
  const purchases = generatePurchases(400, users, allRoutines, rand);

  const lines: string[] = [];
  lines.push(
    "-- Additive seed: ~200 demo users and ~400 demo purchases for stats/admin views at scale.",
    "-- firebase_uid values here are synthetic and are not backed by real Firebase accounts.",
    "",
    "INSERT INTO users (firebase_uid, email, display_name, locale_pref, created_at, updated_at, last_login_at) VALUES",
  );
  const userRows = users.map(
    (u) =>
      `  (${sqlString(u.firebaseUid)}, ${sqlString(u.email)}, ${sqlString(u.displayName)}, ${sqlString(u.localePref)}, ${sqlString(u.createdAt)}, ${sqlString(u.lastLoginAt)}, ${sqlString(u.lastLoginAt)})`,
  );
  lines.push(`${userRows.join(",\n")};`, "");

  lines.push(
    "INSERT INTO purchases (id, firebase_uid, routine_slug, provider, amount_ils, currency, status, created_at, paid_at) VALUES",
  );
  const purchaseRows = purchases.map(
    (p) =>
      `  (${sqlString(p.id)}, ${sqlString(p.firebaseUid)}, ${sqlString(p.routineSlug)}, 'demo', ${p.amountIls}, 'ILS', ${sqlString(p.status)}, ${sqlString(p.createdAt)}, ${p.paidAt ? sqlString(p.paidAt) : "NULL"})`,
  );
  lines.push(`${purchaseRows.join(",\n")};`, "");

  const filePath = path.join(ROOT, "migrations", "0008_seed_demo_users_purchases.sql");
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

// --- Main --------------------------------------------------------------------

const CURATED_ROUTINES = [
  { slug: "levitating", pricing: { original: 59, earlyBird: 39 } },
  { slug: "kill-bill", pricing: { original: 59, earlyBird: 39 } },
  { slug: "earned-it", pricing: { original: 59, earlyBird: 39 } },
];

function main() {
  const newInstructors = pickNewInstructors();
  const newRoutines = generateRoutines(newInstructors);

  console.log(`Generated ${newInstructors.length} new instructors, ${newRoutines.length} new routines.`);

  writeInstructorsTs(newInstructors);
  writeRoutinesTs(newRoutines);
  writeMockContent(newRoutines, newInstructors);
  writeCatalogSeedMigration(newRoutines, newInstructors);
  writeUsersPurchasesMigration(newRoutines, CURATED_ROUTINES);

  console.log("Done. Review the diffs in lib/, mocks/content/, and migrations/ before committing.");
}

main();
