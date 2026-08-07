/**
 * Catalog types + **temporary in-memory mock routines**.
 * Replace data access with server/CMS fetches when the API is ready;
 * keep these shapes stable so UI can swap the source without rewrites.
 */
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

export type DanceStyleKey = "jazz-funk" | "hip-hop" | "heels";
export type LevelKey = "intermediate" | "advanced" | "all-levels";
export type TagKey =
  | DanceStyleKey
  | "performance"
  | "groove"
  | "musicality"
  | "body-control";
export type ChapterId =
  | "full-performance"
  | "breakdown"
  | "slow-practice"
  | "full-speed";

export interface VideoChapter {
  id: ChapterId;
  /** Timestamp in seconds where this section of the routine begins. */
  time: number;
}

export interface RoutineRecord {
  slug: string;
  title: string;
  instructorSlug: string;
  level: LevelKey;
  style: DanceStyleKey;
  /** Filter tags (style + technique labels). MOCK demo metadata. */
  tags: TagKey[];
  songName: string;
  artist: string;
  bpm: string;
  /** Duration timestamp without locale suffix, e.g. "3:23". */
  length: string;
  poster: string;
  videoSrc: string;
  chapters: VideoChapter[];
  checkoutHref: string;
  pricing: {
    original: number;
    earlyBird: number;
  };
}

const SAMPLE_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const ROUTINES: RoutineRecord[] = [
  // MOCK combinations for demo UI — songs/artists are placeholders (licensing TBD).
  {
    slug: "levitating",
    title: "Levitating",
    instructorSlug: "maya-azulai",
    level: "intermediate",
    style: "jazz-funk",
    tags: ["jazz-funk", "performance"],
    songName: "Levitating",
    artist: "Dua Lipa",
    bpm: "103 BPM",
    length: "3:23",
    poster: "/routine-poster-midnight-static.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", time: 0 },
      { id: "breakdown", time: 22 },
      { id: "slow-practice", time: 58 },
      { id: "full-speed", time: 96 },
    ],
    checkoutHref: "/checkout/levitating",
    pricing: {
      original: 49,
      earlyBird: 29,
    },
  },
  {
    slug: "kill-bill",
    title: "Kill Bill",
    instructorSlug: "daniel-cohen",
    level: "advanced",
    style: "hip-hop",
    tags: ["hip-hop", "groove", "musicality"],
    songName: "Kill Bill",
    artist: "SZA",
    bpm: "89 BPM",
    length: "2:33",
    poster: "/routine-poster-neon-nights.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", time: 0 },
      { id: "breakdown", time: 20 },
      { id: "slow-practice", time: 55 },
      { id: "full-speed", time: 92 },
    ],
    checkoutHref: "/checkout/kill-bill",
    pricing: {
      original: 49,
      earlyBird: 29,
    },
  },
  {
    slug: "earned-it",
    title: "Earned It",
    instructorSlug: "noa-sagi",
    level: "all-levels",
    style: "heels",
    tags: ["heels", "body-control", "performance"],
    songName: "Earned It",
    artist: "The Weeknd",
    bpm: "120 BPM",
    length: "4:10",
    poster: "/routine-poster-velvet-heels.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", time: 0 },
      { id: "breakdown", time: 24 },
      { id: "slow-practice", time: 60 },
      { id: "full-speed", time: 98 },
    ],
    checkoutHref: "/checkout/earned-it",
    pricing: {
      original: 49,
      earlyBird: 29,
    },
  },
];

export function getAllRoutines(): RoutineRecord[] {
  return ROUTINES;
}

export function getRoutineBySlug(slug: string): RoutineRecord | undefined {
  return ROUTINES.find((routine) => routine.slug === slug);
}

export function getRoutinesByInstructor(instructorSlug: string): RoutineRecord[] {
  return ROUTINES.filter((routine) => routine.instructorSlug === instructorSlug);
}

export function getRoutinesByStyle(style: string): RoutineRecord[] {
  return ROUTINES.filter((routine) => routine.style === style);
}

export function getRoutinesByLevel(level: string): RoutineRecord[] {
  return ROUTINES.filter((routine) => routine.level === level);
}

export function getAllRoutineStyles(): DanceStyleKey[] {
  return [...new Set(ROUTINES.map((routine) => routine.style))];
}

export function getAllRoutineLevels(): LevelKey[] {
  return [...new Set(ROUTINES.map((routine) => routine.level))];
}

export interface RoutinesFilterParams {
  instructor?: string;
  style?: string;
  level?: string;
  locale?: Locale;
}

/** Build a locale-aware tutorials catalog URL from the active filters. */
export function routinesFilterHref({
  instructor,
  style,
  level,
  locale = "he",
}: RoutinesFilterParams): string {
  const params = new URLSearchParams();
  if (instructor) params.set("instructor", instructor);
  if (style) params.set("style", style);
  if (level) params.set("level", level);
  const query = params.toString();
  const base = localePath(locale, "/routines");
  return query ? `${base}?${query}` : base;
}
