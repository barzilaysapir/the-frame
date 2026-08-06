/**
 * MOCK name banks for demo / UI work only.
 * Not production content — licensing, real teachers, and Instagram handles TBD.
 * Pick from these lists when adding sample combinations; keep live
 * `INSTRUCTORS` / `ROUTINES` as the published subset.
 */

export type DanceStyle = "ג'אז פאנק" | "היפ הופ" | "עקבים";

export interface TeacherNameSeed {
  /** URL-safe id, e.g. "tali-mizrahi" */
  slug: string;
  name: string;
  /** Preferred style for this teacher seed. */
  style: DanceStyle;
}

export interface SongSeed {
  /** URL-safe id, usually the song title slug */
  slug: string;
  title: string;
  artist: string;
  /** Rough BPM for demo metadata */
  bpm: number;
  /** Approx length as mm:ss */
  length: string;
  /** Styles this track fits well */
  styles: DanceStyle[];
}

/** MOCK Hebrew teacher-name pool (demo only; not all published on the site). */
export const TEACHER_NAME_BANK: TeacherNameSeed[] = [
  { slug: "tali-mizrahi", name: "טלי מזרחי", style: "ג'אז פאנק" },
  { slug: "yael-bar", name: "יעל בר", style: "ג'אז פאנק" },
  { slug: "roni-ashkenazi", name: "רוני אשכנזי", style: "ג'אז פאנק" },
  { slug: "lior-hadad", name: "ליאור חדד", style: "ג'אז פאנק" },
  { slug: "shira-levi", name: "שירה לוי", style: "ג'אז פאנק" },
  { slug: "oran-ben-david", name: "אורן בן דוד", style: "היפ הופ" },
  { slug: "amit-sharabi", name: "עמית שרעבי", style: "היפ הופ" },
  { slug: "ido-malka", name: "עידו מלכה", style: "היפ הופ" },
  { slug: "gal-peretz", name: "גל פרץ", style: "היפ הופ" },
  { slug: "tom-avraham", name: "תום אברהם", style: "היפ הופ" },
  { slug: "maya-rozin", name: "מאיה רוזין", style: "עקבים" },
  { slug: "noga-eliyahu", name: "נגה אליהו", style: "עקבים" },
  { slug: "adi-sabag", name: "עדי סבג", style: "עקבים" },
  { slug: "yuval-cohen", name: "יובל כהן", style: "עקבים" },
  { slug: "eden-biton", name: "עדן ביטון", style: "עקבים" },
];

/** MOCK pop / R&B song pool for demo combinations (licensing TBD). */
export const SONG_NAME_BANK: SongSeed[] = [
  {
    slug: "levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    bpm: 103,
    length: "3:23",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "dont-start-now",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    bpm: 124,
    length: "3:03",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "physical",
    title: "Physical",
    artist: "Dua Lipa",
    bpm: 147,
    length: "3:13",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "about-damn-time",
    title: "About Damn Time",
    artist: "Lizzo",
    bpm: 109,
    length: "3:11",
    styles: ["ג'אז פאנק", "היפ הופ"],
  },
  {
    slug: "good-as-hell",
    title: "Good as Hell",
    artist: "Lizzo",
    bpm: 96,
    length: "2:39",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "flowers",
    title: "Flowers",
    artist: "Miley Cyrus",
    bpm: 118,
    length: "3:20",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "kill-bill",
    title: "Kill Bill",
    artist: "SZA",
    bpm: 89,
    length: "2:33",
    styles: ["היפ הופ", "עקבים"],
  },
  {
    slug: "snooze",
    title: "Snooze",
    artist: "SZA",
    bpm: 77,
    length: "3:21",
    styles: ["עקבים"],
  },
  {
    slug: "shirt",
    title: "Shirt",
    artist: "SZA",
    bpm: 120,
    length: "3:01",
    styles: ["עקבים", "ג'אז פאנק"],
  },
  {
    slug: "earned-it",
    title: "Earned It",
    artist: "The Weeknd",
    bpm: 120,
    length: "4:10",
    styles: ["עקבים"],
  },
  {
    slug: "die-for-you",
    title: "Die For You",
    artist: "The Weeknd",
    bpm: 67,
    length: "4:20",
    styles: ["עקבים"],
  },
  {
    slug: "blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 171,
    length: "3:20",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "creepin",
    title: "Creepin'",
    artist: "Metro Boomin, The Weeknd, 21 Savage",
    bpm: 98,
    length: "3:41",
    styles: ["היפ הופ", "עקבים"],
  },
  {
    slug: "need-to-know",
    title: "Need to Know",
    artist: "Doja Cat",
    bpm: 130,
    length: "3:30",
    styles: ["עקבים", "ג'אז פאנק"],
  },
  {
    slug: "kiss-me-more",
    title: "Kiss Me More",
    artist: "Doja Cat ft. SZA",
    bpm: 111,
    length: "3:28",
    styles: ["ג'אז פאנק", "עקבים"],
  },
  {
    slug: "woman",
    title: "Woman",
    artist: "Doja Cat",
    bpm: 128,
    length: "2:52",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "first-class",
    title: "First Class",
    artist: "Jack Harlow",
    bpm: 107,
    length: "2:53",
    styles: ["היפ הופ"],
  },
  {
    slug: "industry-baby",
    title: "Industry Baby",
    artist: "Lil Nas X & Jack Harlow",
    bpm: 150,
    length: "3:32",
    styles: ["היפ הופ"],
  },
  {
    slug: "god-s-plan",
    title: "God's Plan",
    artist: "Drake",
    bpm: 77,
    length: "3:18",
    styles: ["היפ הופ"],
  },
  {
    slug: "nice-for-what",
    title: "Nice For What",
    artist: "Drake",
    bpm: 93,
    length: "3:30",
    styles: ["היפ הופ", "ג'אז פאנק"],
  },
  {
    slug: "as-it-was",
    title: "As It Was",
    artist: "Harry Styles",
    bpm: 174,
    length: "2:47",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "anti-hero",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    bpm: 97,
    length: "3:20",
    styles: ["ג'אז פאנק"],
  },
  {
    slug: "savage",
    title: "Savage",
    artist: "Megan Thee Stallion",
    bpm: 127,
    length: "2:35",
    styles: ["היפ הופ"],
  },
  {
    slug: "body",
    title: "Body",
    artist: "Megan Thee Stallion",
    bpm: 123,
    length: "2:51",
    styles: ["היפ הופ", "ג'אז פאנק"],
  },
];

export function getTeacherSeedsByStyle(style: DanceStyle): TeacherNameSeed[] {
  return TEACHER_NAME_BANK.filter((teacher) => teacher.style === style);
}

export function getSongSeedsByStyle(style: DanceStyle): SongSeed[] {
  return SONG_NAME_BANK.filter((song) => song.styles.includes(style));
}

export function getSongSeedBySlug(slug: string): SongSeed | undefined {
  return SONG_NAME_BANK.find((song) => song.slug === slug);
}

export function getTeacherSeedBySlug(slug: string): TeacherNameSeed | undefined {
  return TEACHER_NAME_BANK.find((teacher) => teacher.slug === slug);
}
