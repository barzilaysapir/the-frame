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
  // jazz-funk
  { slug: "tali-mizrahi", name: "טלי מזרחי", style: "jazz-funk" },
  { slug: "yael-bar", name: "יעל בר", style: "jazz-funk" },
  { slug: "roni-ashkenazi", name: "רוני אשכנזי", style: "jazz-funk" },
  { slug: "lior-hadad", name: "ליאור חדד", style: "jazz-funk" },
  { slug: "shira-levi", name: "שירה לוי", style: "jazz-funk" },
  { slug: "dana-shwartz", name: "דנה שוורץ", style: "jazz-funk" },
  { slug: "michal-ozeri", name: "מיכל עוזרי", style: "jazz-funk" },
  { slug: "ronit-peleg", name: "רונית פלג", style: "jazz-funk" },
  // hip-hop
  { slug: "oran-ben-david", name: "אורן בן דוד", style: "hip-hop" },
  { slug: "amit-sharabi", name: "עמית שרעבי", style: "hip-hop" },
  { slug: "ido-malka", name: "עידו מלכה", style: "hip-hop" },
  { slug: "gal-peretz", name: "גל פרץ", style: "hip-hop" },
  { slug: "tom-avraham", name: "תום אברהם", style: "hip-hop" },
  { slug: "nadav-biton", name: "נדב ביטון", style: "hip-hop" },
  { slug: "elad-mor", name: "אלעד מור", style: "hip-hop" },
  { slug: "shai-vaknin", name: "שי וקנין", style: "hip-hop" },
  // heels
  { slug: "maya-rozin", name: "מאיה רוזין", style: "heels" },
  { slug: "noga-eliyahu", name: "נגה אליהו", style: "heels" },
  { slug: "adi-sabag", name: "עדי סבג", style: "heels" },
  { slug: "yuval-cohen", name: "יובל כהן", style: "heels" },
  { slug: "eden-biton", name: "עדן ביטון", style: "heels" },
  { slug: "liat-damari", name: "ליאת דמארי", style: "heels" },
  { slug: "keren-azoulay", name: "קרן אזולאי", style: "heels" },
  { slug: "tamar-bengal", name: "תמר בנג'ל", style: "heels" },
  // jazz
  { slug: "yasmin-kadosh", name: "יסמין קדוש", style: "jazz" },
  { slug: "omer-tzur", name: "עומר צור", style: "jazz" },
  { slug: "hila-ben-ari", name: "הילה בן ארי", style: "jazz" },
  { slug: "ariel-navon", name: "אריאל נבון", style: "jazz" },
  { slug: "sivan-refael", name: "סיוון רפאל", style: "jazz" },
  { slug: "nitzan-kfir", name: "ניצן כפיר", style: "jazz" },
  { slug: "maayan-dahan", name: "מעיין דהן", style: "jazz" },
  // afro
  { slug: "efrat-wolde", name: "אפרת וולדה", style: "afro" },
  { slug: "yonatan-tesfaye", name: "יונתן טספאיה", style: "afro" },
  { slug: "bruria-alemu", name: "ברוריה אלמו", style: "afro" },
  { slug: "rami-adisu", name: "רמי אדיסו", style: "afro" },
  { slug: "noy-getahun", name: "נוי גטהון", style: "afro" },
  { slug: "dvir-mengistu", name: "דביר מנגיסטו", style: "afro" },
  { slug: "shani-baruch", name: "שני ברוך", style: "afro" },
  // dancehall
  { slug: "or-katz", name: "אור כץ", style: "dancehall" },
  { slug: "tamir-levy", name: "תמיר לוי", style: "dancehall" },
  { slug: "yael-marciano", name: "יעל מרציאנו", style: "dancehall" },
  { slug: "ben-suissa", name: "בן סויסה", style: "dancehall" },
  { slug: "chen-malul", name: "חן מלול", style: "dancehall" },
  { slug: "aviv-regev", name: "אביב רגב", style: "dancehall" },
  { slug: "lea-assayag", name: "ליה אסייג", style: "dancehall" },
  // commercial
  { slug: "michal-buzaglo", name: "מיכל בוזגלו", style: "commercial" },
  { slug: "guy-ravid", name: "גיא רביד", style: "commercial" },
  { slug: "noa-fink", name: "נועה פינק", style: "commercial" },
  { slug: "itay-shemesh", name: "איתי שמש", style: "commercial" },
  { slug: "karin-vaturi", name: "קארין ותורי", style: "commercial" },
  { slug: "dean-alfasi", name: "דין אלפסי", style: "commercial" },
  { slug: "roy-amsalem", name: "רועי אמסלם", style: "commercial" },
];

/** MOCK pop / R&B / afrobeats / dancehall song pool for demo combinations (licensing TBD). */
export const SONG_NAME_BANK: SongSeed[] = [
  // --- original jazz-funk / hip-hop / heels seeds ---
  { slug: "levitating", title: "Levitating", artist: "Dua Lipa", bpm: 103, length: "3:23", styles: ["jazz-funk"] },
  { slug: "dont-start-now", title: "Don't Start Now", artist: "Dua Lipa", bpm: 124, length: "3:03", styles: ["jazz-funk"] },
  { slug: "physical", title: "Physical", artist: "Dua Lipa", bpm: 147, length: "3:13", styles: ["jazz-funk"] },
  { slug: "about-damn-time", title: "About Damn Time", artist: "Lizzo", bpm: 109, length: "3:11", styles: ["jazz-funk", "hip-hop"] },
  { slug: "good-as-hell", title: "Good as Hell", artist: "Lizzo", bpm: 96, length: "2:39", styles: ["jazz-funk"] },
  { slug: "flowers", title: "Flowers", artist: "Miley Cyrus", bpm: 118, length: "3:20", styles: ["jazz-funk"] },
  { slug: "kill-bill", title: "Kill Bill", artist: "SZA", bpm: 89, length: "2:33", styles: ["hip-hop", "heels"] },
  { slug: "snooze", title: "Snooze", artist: "SZA", bpm: 77, length: "3:21", styles: ["heels"] },
  { slug: "shirt", title: "Shirt", artist: "SZA", bpm: 120, length: "3:01", styles: ["heels", "jazz-funk"] },
  { slug: "earned-it", title: "Earned It", artist: "The Weeknd", bpm: 120, length: "4:10", styles: ["heels"] },
  { slug: "die-for-you", title: "Die For You", artist: "The Weeknd", bpm: 67, length: "4:20", styles: ["heels"] },
  { slug: "blinding-lights", title: "Blinding Lights", artist: "The Weeknd", bpm: 171, length: "3:20", styles: ["jazz-funk"] },
  { slug: "creepin", title: "Creepin'", artist: "Metro Boomin, The Weeknd, 21 Savage", bpm: 98, length: "3:41", styles: ["hip-hop", "heels"] },
  { slug: "need-to-know", title: "Need to Know", artist: "Doja Cat", bpm: 130, length: "3:30", styles: ["heels", "jazz-funk"] },
  { slug: "kiss-me-more", title: "Kiss Me More", artist: "Doja Cat ft. SZA", bpm: 111, length: "3:28", styles: ["jazz-funk", "heels"] },
  { slug: "woman", title: "Woman", artist: "Doja Cat", bpm: 128, length: "2:52", styles: ["jazz-funk"] },
  { slug: "first-class", title: "First Class", artist: "Jack Harlow", bpm: 107, length: "2:53", styles: ["hip-hop"] },
  { slug: "industry-baby", title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", bpm: 150, length: "3:32", styles: ["hip-hop"] },
  { slug: "god-s-plan", title: "God's Plan", artist: "Drake", bpm: 77, length: "3:18", styles: ["hip-hop"] },
  { slug: "nice-for-what", title: "Nice For What", artist: "Drake", bpm: 93, length: "3:30", styles: ["hip-hop", "jazz-funk"] },
  { slug: "as-it-was", title: "As It Was", artist: "Harry Styles", bpm: 174, length: "2:47", styles: ["jazz-funk"] },
  { slug: "anti-hero", title: "Anti-Hero", artist: "Taylor Swift", bpm: 97, length: "3:20", styles: ["jazz-funk"] },
  { slug: "savage", title: "Savage", artist: "Megan Thee Stallion", bpm: 127, length: "2:35", styles: ["hip-hop"] },
  { slug: "body", title: "Body", artist: "Megan Thee Stallion", bpm: 123, length: "2:51", styles: ["hip-hop", "jazz-funk"] },

  // --- extra jazz-funk ---
  { slug: "forever", title: "Forever", artist: "Chris Brown", bpm: 104, length: "4:20", styles: ["jazz-funk"] },
  { slug: "cant-stop-the-feeling", title: "Can't Stop the Feeling", artist: "Justin Timberlake", bpm: 113, length: "3:56", styles: ["jazz-funk", "commercial"] },
  { slug: "treasure", title: "Treasure", artist: "Bruno Mars", bpm: 128, length: "3:18", styles: ["jazz-funk"] },
  { slug: "24k-magic", title: "24K Magic", artist: "Bruno Mars", bpm: 107, length: "3:46", styles: ["jazz-funk"] },
  { slug: "come-down", title: "Come Down", artist: "Anderson .Paak", bpm: 107, length: "3:23", styles: ["jazz-funk"] },
  { slug: "leave-the-door-open", title: "Leave the Door Open", artist: "Silk Sonic", bpm: 80, length: "4:02", styles: ["jazz-funk"] },
  { slug: "virtual-insanity", title: "Virtual Insanity", artist: "Jamiroquai", bpm: 105, length: "4:22", styles: ["jazz-funk"] },
  { slug: "aint-nobody", title: "Ain't Nobody", artist: "Chaka Khan", bpm: 121, length: "4:14", styles: ["jazz-funk"] },

  // --- extra hip-hop ---
  { slug: "get-ur-freak-on", title: "Get Ur Freak On", artist: "Missy Elliott", bpm: 100, length: "3:53", styles: ["hip-hop"] },
  { slug: "work-it", title: "Work It", artist: "Missy Elliott", bpm: 100, length: "3:23", styles: ["hip-hop"] },
  { slug: "sicko-mode", title: "Sicko Mode", artist: "Travis Scott", bpm: 155, length: "5:12", styles: ["hip-hop"] },
  { slug: "humble", title: "Humble", artist: "Kendrick Lamar", bpm: 150, length: "2:57", styles: ["hip-hop"] },
  { slug: "dna", title: "DNA", artist: "Kendrick Lamar", bpm: 140, length: "3:05", styles: ["hip-hop"] },
  { slug: "in-da-club", title: "In Da Club", artist: "50 Cent", bpm: 90, length: "3:13", styles: ["hip-hop"] },
  { slug: "move", title: "Move", artist: "Ludacris", bpm: 110, length: "3:31", styles: ["hip-hop"] },
  { slug: "give-it-to-me", title: "Give It To Me", artist: "Timbaland", bpm: 100, length: "4:20", styles: ["hip-hop"] },

  // --- extra heels ---
  { slug: "body-party", title: "Body Party", artist: "Ciara", bpm: 67, length: "4:00", styles: ["heels"] },
  { slug: "ride", title: "Ride", artist: "Ciara", bpm: 65, length: "4:36", styles: ["heels"] },
  { slug: "2-on", title: "2 On", artist: "Tinashe", bpm: 100, length: "3:33", styles: ["heels"] },
  { slug: "distraction", title: "Distraction", artist: "Kehlani", bpm: 100, length: "3:17", styles: ["heels"] },
  { slug: "me-and-u", title: "Me & U", artist: "Cassie", bpm: 130, length: "3:34", styles: ["heels"] },
  { slug: "rock-the-boat", title: "Rock the Boat", artist: "Aaliyah", bpm: 75, length: "4:04", styles: ["heels"] },
  { slug: "gonna-love-me", title: "Gonna Love Me", artist: "Teyana Taylor", bpm: 85, length: "4:20", styles: ["heels"] },
  { slug: "cellophane", title: "Cellophane", artist: "FKA twigs", bpm: 70, length: "4:57", styles: ["heels"] },

  // --- jazz ---
  { slug: "easy-on-me", title: "Easy On Me", artist: "Adele", bpm: 62, length: "3:44", styles: ["jazz"] },
  { slug: "rolling-in-the-deep", title: "Rolling in the Deep", artist: "Adele", bpm: 105, length: "3:48", styles: ["jazz", "jazz-funk"] },
  { slug: "stay-with-me", title: "Stay With Me", artist: "Sam Smith", bpm: 79, length: "2:53", styles: ["jazz"] },
  { slug: "unholy", title: "Unholy", artist: "Sam Smith ft. Kim Petras", bpm: 131, length: "2:36", styles: ["jazz", "commercial"] },
  { slug: "ocean-eyes", title: "Ocean Eyes", artist: "Billie Eilish", bpm: 79, length: "3:20", styles: ["jazz"] },
  { slug: "happier-than-ever", title: "Happier Than Ever", artist: "Billie Eilish", bpm: 87, length: "4:58", styles: ["jazz"] },
  { slug: "best-part", title: "Best Part", artist: "H.E.R. ft. Daniel Caesar", bpm: 68, length: "3:29", styles: ["jazz"] },
  { slug: "someone-you-loved", title: "Someone You Loved", artist: "Lewis Capaldi", bpm: 110, length: "3:02", styles: ["jazz"] },
  { slug: "my-hair", title: "my hair", artist: "Ariana Grande", bpm: 55, length: "2:41", styles: ["jazz"] },
  { slug: "be-honest", title: "Be Honest", artist: "Jorja Smith", bpm: 100, length: "3:29", styles: ["jazz", "afro"] },
  { slug: "if-i-aint-got-you", title: "If I Ain't Got You", artist: "Alicia Keys", bpm: 94, length: "3:48", styles: ["jazz"] },
  { slug: "all-of-me", title: "All of Me", artist: "John Legend", bpm: 63, length: "4:29", styles: ["jazz"] },
  { slug: "get-you", title: "Get You", artist: "Daniel Caesar ft. Kali Uchis", bpm: 85, length: "4:08", styles: ["jazz"] },
  { slug: "toronto", title: "Toronto", artist: "Snoh Aalegra", bpm: 88, length: "3:07", styles: ["jazz"] },
  { slug: "sativa", title: "Sativa", artist: "Jhené Aiko ft. Rae Sremmurd", bpm: 140, length: "3:15", styles: ["jazz", "hip-hop"] },
  { slug: "higher", title: "Higher", artist: "Tems", bpm: 100, length: "3:14", styles: ["jazz", "afro"] },
  { slug: "pink-and-white", title: "Pink + White", artist: "Frank Ocean", bpm: 100, length: "3:04", styles: ["jazz"] },
  { slug: "distance", title: "Distance", artist: "Emily King", bpm: 95, length: "3:37", styles: ["jazz"] },

  // --- afro ---
  { slug: "last-last", title: "Last Last", artist: "Burna Boy", bpm: 103, length: "3:15", styles: ["afro"] },
  { slug: "kilometre", title: "Kilometre", artist: "Burna Boy", bpm: 105, length: "3:33", styles: ["afro"] },
  { slug: "essence", title: "Essence", artist: "Wizkid ft. Tems", bpm: 103, length: "4:08", styles: ["afro"] },
  { slug: "ojuelegba", title: "Ojuelegba", artist: "Wizkid", bpm: 100, length: "3:47", styles: ["afro"] },
  { slug: "fall", title: "Fall", artist: "Davido", bpm: 102, length: "4:07", styles: ["afro"] },
  { slug: "unavailable", title: "Unavailable", artist: "Davido ft. Musa Keys", bpm: 107, length: "2:58", styles: ["afro", "commercial"] },
  { slug: "calm-down", title: "Calm Down", artist: "Rema", bpm: 107, length: "3:39", styles: ["afro", "commercial"] },
  { slug: "dumebi", title: "Dumebi", artist: "Rema", bpm: 104, length: "3:17", styles: ["afro"] },
  { slug: "love-nwantiti", title: "Love Nwantiti", artist: "CKay", bpm: 108, length: "2:47", styles: ["afro"] },
  { slug: "free-mind", title: "Free Mind", artist: "Tems", bpm: 105, length: "3:47", styles: ["afro"] },
  { slug: "peru", title: "Peru", artist: "Fireboy DML", bpm: 103, length: "2:52", styles: ["afro"] },
  { slug: "rush", title: "Rush", artist: "Ayra Starr", bpm: 103, length: "2:50", styles: ["afro", "commercial"] },
  { slug: "terminator", title: "Terminator", artist: "Asake", bpm: 103, length: "2:53", styles: ["afro", "dancehall"] },
  { slug: "soso", title: "Soso", artist: "Omah Lay", bpm: 104, length: "3:18", styles: ["afro"] },
  { slug: "sad-girlz-luv-money", title: "Sad Girlz Luv Money", artist: "Amaarae", bpm: 100, length: "2:37", styles: ["afro", "commercial"] },
  { slug: "pana", title: "Pana", artist: "Tekno", bpm: 110, length: "3:38", styles: ["afro"] },
  { slug: "leg-over", title: "Leg Over", artist: "Mr Eazi", bpm: 101, length: "3:35", styles: ["afro"] },
  { slug: "touch-it", title: "Touch It", artist: "KiDi", bpm: 105, length: "3:20", styles: ["afro", "dancehall"] },

  // --- dancehall ---
  { slug: "temperature", title: "Temperature", artist: "Sean Paul", bpm: 98, length: "3:24", styles: ["dancehall"] },
  { slug: "get-busy", title: "Get Busy", artist: "Sean Paul", bpm: 95, length: "3:36", styles: ["dancehall"] },
  { slug: "family", title: "Family", artist: "Popcaan", bpm: 101, length: "3:20", styles: ["dancehall"] },
  { slug: "ova-dweet", title: "Ova Dweet", artist: "Popcaan", bpm: 100, length: "3:12", styles: ["dancehall"] },
  { slug: "blessed", title: "Blessed", artist: "Shenseea", bpm: 100, length: "3:03", styles: ["dancehall", "commercial"] },
  { slug: "lick", title: "Lick", artist: "Shenseea", bpm: 98, length: "3:07", styles: ["dancehall"] },
  { slug: "bruk-off-yuh-back", title: "Bruk Off Yuh Back", artist: "Konshens", bpm: 105, length: "3:05", styles: ["dancehall"] },
  { slug: "fever", title: "Fever", artist: "Vybz Kartel", bpm: 100, length: "3:12", styles: ["dancehall"] },
  { slug: "so-mi-like-it", title: "So Mi Like It", artist: "Spice", bpm: 103, length: "2:58", styles: ["dancehall"] },
  { slug: "coke", title: "Coke", artist: "Skillibeng", bpm: 100, length: "2:40", styles: ["dancehall"] },
  { slug: "ina-real-life", title: "Ina Real Life", artist: "Alkaline", bpm: 98, length: "3:10", styles: ["dancehall"] },
  { slug: "owe-me-nothing", title: "Owe Me Nothing", artist: "Dexta Daps", bpm: 95, length: "3:36", styles: ["dancehall"] },
  { slug: "hold-you", title: "Hold You", artist: "Gyptian", bpm: 95, length: "3:28", styles: ["dancehall"] },
  { slug: "bulla-wine", title: "Bulla Wine", artist: "Ding Dong", bpm: 108, length: "3:00", styles: ["dancehall"] },
  { slug: "zombies", title: "Zombies", artist: "Chronic Law", bpm: 100, length: "3:15", styles: ["dancehall"] },
  { slug: "fed-up", title: "Fed Up", artist: "Masicka", bpm: 99, length: "3:05", styles: ["dancehall"] },
  { slug: "soundbwoy", title: "Soundbwoy", artist: "Stylo G", bpm: 102, length: "3:14", styles: ["dancehall"] },
  { slug: "king-of-the-dancehall", title: "King of the Dancehall", artist: "Beenie Man", bpm: 100, length: "3:22", styles: ["dancehall"] },

  // --- commercial ---
  { slug: "break-my-soul", title: "Break My Soul", artist: "Beyoncé", bpm: 115, length: "4:38", styles: ["commercial"] },
  { slug: "formation", title: "Formation", artist: "Beyoncé", bpm: 115, length: "3:26", styles: ["commercial", "hip-hop"] },
  { slug: "umbrella", title: "Umbrella", artist: "Rihanna", bpm: 87, length: "4:36", styles: ["commercial"] },
  { slug: "dont-stop-the-music", title: "Don't Stop the Music", artist: "Rihanna", bpm: 123, length: "4:33", styles: ["commercial"] },
  { slug: "7-rings", title: "7 rings", artist: "Ariana Grande", bpm: 140, length: "2:58", styles: ["commercial"] },
  { slug: "break-free", title: "Break Free", artist: "Ariana Grande", bpm: 128, length: "3:34", styles: ["commercial"] },
  { slug: "on-the-floor", title: "On the Floor", artist: "Jennifer Lopez", bpm: 130, length: "4:04", styles: ["commercial"] },
  { slug: "toxic", title: "Toxic", artist: "Britney Spears", bpm: 143, length: "3:19", styles: ["commercial"] },
  { slug: "gimme-more", title: "Gimme More", artist: "Britney Spears", bpm: 110, length: "4:06", styles: ["commercial"] },
  { slug: "dirrty", title: "Dirrty", artist: "Christina Aguilera", bpm: 100, length: "4:04", styles: ["commercial", "hip-hop"] },
  { slug: "super-bass", title: "Super Bass", artist: "Nicki Minaj", bpm: 140, length: "3:19", styles: ["commercial", "hip-hop"] },
  { slug: "up", title: "Up", artist: "Cardi B", bpm: 140, length: "2:26", styles: ["commercial", "hip-hop"] },
  { slug: "say-so", title: "Say So", artist: "Doja Cat", bpm: 110, length: "3:57", styles: ["commercial"] },
  { slug: "havana", title: "Havana", artist: "Camila Cabello", bpm: 105, length: "3:37", styles: ["commercial"] },
  { slug: "new-rules", title: "New Rules", artist: "Dua Lipa", bpm: 116, length: "3:29", styles: ["commercial", "jazz-funk"] },
  { slug: "padam-padam", title: "Padam Padam", artist: "Kylie Minogue", bpm: 124, length: "2:53", styles: ["commercial"] },
  { slug: "boom-clap", title: "Boom Clap", artist: "Charli XCX", bpm: 100, length: "3:26", styles: ["commercial"] },
  { slug: "espresso", title: "Espresso", artist: "Sabrina Carpenter", bpm: 104, length: "2:55", styles: ["commercial"] },
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
