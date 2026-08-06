export interface VideoChapter {
  id: string;
  label: string;
  /** Timestamp in seconds where this section of the routine begins. */
  time: number;
}

export interface RoutineRecord {
  slug: string;
  title: string;
  instructorSlug: string;
  level: string;
  style: string;
  songName: string;
  artist: string;
  bpm: string;
  length: string;
  technique: string;
  description: string;
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
    level: "בינוני",
    style: "ג'אז פאנק",
    songName: "Levitating",
    artist: "Dua Lipa",
    bpm: "103 BPM",
    length: "3:23 דקות",
    technique: "איזולציות ומעברי משקל קרקעיים",
    description:
      "קומבינציית ג'אז פאנק אנרגטית עם דגש על איזולציות נקיות ונוכחות בימתית, מושלמת לרקדנים שרוצים לשדרג את הביטוי האישי שלהם על הבמה.",
    poster: "/routine-poster-midnight-static.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 22 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 58 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 96 },
    ],
    checkoutHref: "/checkout/levitating",
    pricing: {
      original: 198,
      earlyBird: 99,
    },
  },
  {
    slug: "kill-bill",
    title: "Kill Bill",
    instructorSlug: "daniel-cohen",
    level: "מתקדם",
    style: "היפ הופ",
    songName: "Kill Bill",
    artist: "SZA",
    bpm: "89 BPM",
    length: "2:33 דקות",
    technique: "גרוב, פוליריתמיקה ועבודת רצפה",
    description:
      "קומבינציית היפ הופ עוצמתית שבנויה על גרוב עמוק ומעברים חדים בין התנועות, לרקדנים שרוצים להעמיק בסגנון עם דגש טכני גבוה.",
    poster: "/routine-poster-neon-nights.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 20 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 55 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 92 },
    ],
    checkoutHref: "/checkout/kill-bill",
    pricing: {
      original: 198,
      earlyBird: 99,
    },
  },
  {
    slug: "earned-it",
    title: "Earned It",
    instructorSlug: "noa-sagi",
    level: "כל הרמות",
    style: "עקבים",
    songName: "Earned It",
    artist: "The Weeknd",
    bpm: "120 BPM",
    length: "4:10 דקות",
    technique: "אורך קו, שליטה בעקב ונוכחות בימתית",
    description:
      "קומבינציית עקבים מפתה ובטוחה, שמלמדת איך לשלוט בעקב מבלי לוותר על טכניקה — כולל דגשים על יציבה, אורך קו וביטחון עצמי על הבמה.",
    poster: "/routine-poster-velvet-heels.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 24 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 60 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 98 },
    ],
    checkoutHref: "/checkout/earned-it",
    pricing: {
      original: 198,
      earlyBird: 99,
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
