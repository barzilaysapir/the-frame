/**
 * MOCK name banks for demo / UI work only.
 * Not production content — licensing, real teachers, and Instagram handles TBD.
 * Pick from these lists when adding sample combinations; keep live
 * `INSTRUCTORS` / `ROUTINES` as the published subset.
 */

import type { DanceStyleKey } from "@/lib/routines";

export type DanceStyle = DanceStyleKey;

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
  { slug: "tali-mizrahi", name: "טלי מזרחי", style: "jazz-funk" },
  { slug: "yael-bar", name: "יעל בר", style: "jazz-funk" },
  { slug: "roni-ashkenazi", name: "רוני אשכנזי", style: "jazz-funk" },
  { slug: "lior-hadad", name: "ליאור חדד", style: "jazz-funk" },
  { slug: "shira-levi", name: "שירה לוי", style: "jazz-funk" },
  { slug: "oran-ben-david", name: "אורן בן דוד", style: "hip-hop" },
  { slug: "amit-sharabi", name: "עמית שרעבי", style: "hip-hop" },
  { slug: "ido-malka", name: "עידו מלכה", style: "hip-hop" },
  { slug: "gal-peretz", name: "גל פרץ", style: "hip-hop" },
  { slug: "tom-avraham", name: "תום אברהם", style: "hip-hop" },
  { slug: "maya-rozin", name: "מאיה רוזין", style: "heels" },
  { slug: "noga-eliyahu", name: "נגה אליהו", style: "heels" },
  { slug: "adi-sabag", name: "עדי סבג", style: "heels" },
  { slug: "yuval-cohen", name: "יובל כהן", style: "heels" },
  { slug: "eden-biton", name: "עדן ביטון", style: "heels" },
];

/** MOCK pop / R&B song pool for demo combinations (licensing TBD). */
export const SONG_NAME_BANK: SongSeed[] = [
  {
    slug: "levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    bpm: 103,
    length: "3:23",
    styles: ["jazz-funk"],
  },
  {
    slug: "dont-start-now",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    bpm: 124,
    length: "3:03",
    styles: ["jazz-funk"],
  },
  {
    slug: "physical",
    title: "Physical",
    artist: "Dua Lipa",
    bpm: 147,
    length: "3:13",
    styles: ["jazz-funk"],
  },
  {
    slug: "about-damn-time",
    title: "About Damn Time",
    artist: "Lizzo",
    bpm: 109,
    length: "3:11",
    styles: ["jazz-funk", "hip-hop"],
  },
  {
    slug: "good-as-hell",
    title: "Good as Hell",
    artist: "Lizzo",
    bpm: 96,
    length: "2:39",
    styles: ["jazz-funk"],
  },
  {
    slug: "flowers",
    title: "Flowers",
    artist: "Miley Cyrus",
    bpm: 118,
    length: "3:20",
    styles: ["jazz-funk"],
  },
  {
    slug: "kill-bill",
    title: "Kill Bill",
    artist: "SZA",
    bpm: 89,
    length: "2:33",
    styles: ["hip-hop", "heels"],
  },
  {
    slug: "snooze",
    title: "Snooze",
    artist: "SZA",
    bpm: 77,
    length: "3:21",
    styles: ["heels"],
  },
  {
    slug: "shirt",
    title: "Shirt",
    artist: "SZA",
    bpm: 120,
    length: "3:01",
    styles: ["heels", "jazz-funk"],
  },
  {
    slug: "earned-it",
    title: "Earned It",
    artist: "The Weeknd",
    bpm: 120,
    length: "4:10",
    styles: ["heels"],
  },
  {
    slug: "die-for-you",
    title: "Die For You",
    artist: "The Weeknd",
    bpm: 67,
    length: "4:20",
    styles: ["heels"],
  },
  {
    slug: "blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 171,
    length: "3:20",
    styles: ["jazz-funk"],
  },
  {
    slug: "creepin",
    title: "Creepin'",
    artist: "Metro Boomin, The Weeknd, 21 Savage",
    bpm: 98,
    length: "3:41",
    styles: ["hip-hop", "heels"],
  },
  {
    slug: "need-to-know",
    title: "Need to Know",
    artist: "Doja Cat",
    bpm: 130,
    length: "3:30",
    styles: ["heels", "jazz-funk"],
  },
  {
    slug: "kiss-me-more",
    title: "Kiss Me More",
    artist: "Doja Cat ft. SZA",
    bpm: 111,
    length: "3:28",
    styles: ["jazz-funk", "heels"],
  },
  {
    slug: "woman",
    title: "Woman",
    artist: "Doja Cat",
    bpm: 128,
    length: "2:52",
    styles: ["jazz-funk"],
  },
  {
    slug: "first-class",
    title: "First Class",
    artist: "Jack Harlow",
    bpm: 107,
    length: "2:53",
    styles: ["hip-hop"],
  },
  {
    slug: "industry-baby",
    title: "Industry Baby",
    artist: "Lil Nas X & Jack Harlow",
    bpm: 150,
    length: "3:32",
    styles: ["hip-hop"],
  },
  {
    slug: "god-s-plan",
    title: "God's Plan",
    artist: "Drake",
    bpm: 77,
    length: "3:18",
    styles: ["hip-hop"],
  },
  {
    slug: "nice-for-what",
    title: "Nice For What",
    artist: "Drake",
    bpm: 93,
    length: "3:30",
    styles: ["hip-hop", "jazz-funk"],
  },
  {
    slug: "as-it-was",
    title: "As It Was",
    artist: "Harry Styles",
    bpm: 174,
    length: "2:47",
    styles: ["jazz-funk"],
  },
  {
    slug: "anti-hero",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    bpm: 97,
    length: "3:20",
    styles: ["jazz-funk"],
  },
  {
    slug: "savage",
    title: "Savage",
    artist: "Megan Thee Stallion",
    bpm: 127,
    length: "2:35",
    styles: ["hip-hop"],
  },
  {
    slug: "body",
    title: "Body",
    artist: "Megan Thee Stallion",
    bpm: 123,
    length: "2:51",
    styles: ["hip-hop", "jazz-funk"],
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
