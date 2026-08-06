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
  {
    slug: "neon-nights",
    title: "Neon Nights",
    instructorSlug: "maya-azulai",
    level: "בינוני",
    style: "קומרשל",
    songName: "Neon Nights (Instrumental Version)",
    artist: "Luna Vale",
    bpm: "96 BPM",
    length: "3:42 דקות",
    technique: "איזולציות ומעברי משקל קרקעיים",
    description:
      "רוטינת קומרשל אנרגטית עם דגש על איזולציות נקיות ונוכחות בימתית, מושלמת לרקדנים שרוצים לשדרג את הביטוי האישי שלהם על הבמה.",
    poster: "/routine-poster-neon-nights.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 22 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 58 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 96 },
    ],
    checkoutHref: "/checkout/neon-nights",
    pricing: {
      original: 198,
      earlyBird: 99,
    },
  },
  {
    slug: "midnight-static",
    title: "Midnight Static",
    instructorSlug: "daniel-cohen",
    level: "מתקדם",
    style: "היפ הופ",
    songName: "Midnight Static",
    artist: "Wolf & Ember",
    bpm: "88 BPM",
    length: "3:15 דקות",
    technique: "גרוב, פוליריתמיקה ועבודת רצפה",
    description:
      "רוטינת היפ הופ עוצמתית שבנויה על גרוב עמוק ומעברים חדים בין הקומבינציות, לרקדנים שרוצים להעמיק בסגנון עם דגש טכני גבוה.",
    poster: "/routine-poster-midnight-static.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 20 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 55 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 92 },
    ],
    checkoutHref: "/checkout/midnight-static",
    pricing: {
      original: 198,
      earlyBird: 99,
    },
  },
  {
    slug: "velvet-heels",
    title: "Velvet Heels",
    instructorSlug: "noa-sagi",
    level: "כל הרמות",
    style: "הילס",
    songName: "Velvet Heels",
    artist: "Aria Nightingale",
    bpm: "100 BPM",
    length: "3:28 דקות",
    technique: "אורך קו, שליטה בעקב ונוכחות בימתית",
    description:
      "רוטינת הילס מפתה ובטוחה, שמלמדת איך לשלוט בעקב מבלי לוותר על טכניקה — כולל דגשים על יציבה, אורך קו וביטחון עצמי על הבמה.",
    poster: "/routine-poster-velvet-heels.png",
    videoSrc: SAMPLE_VIDEO_SRC,
    chapters: [
      { id: "full-performance", label: "הופעה מלאה", time: 0 },
      { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 24 },
      { id: "slow-practice", label: "תרגול איטי (50%)", time: 60 },
      { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 98 },
    ],
    checkoutHref: "/checkout/velvet-heels",
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
