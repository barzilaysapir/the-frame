export interface InstructorRecord {
  slug: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  /** Public Instagram profile URL for this teacher. */
  instagramUrl: string;
}

export const INSTRUCTORS: InstructorRecord[] = [
  {
    slug: "maya-azulai",
    name: "מאיה אזולאי",
    role: "מורה לקומרשל",
    bio: "מאיה רקדה בהפקות קומרשל וקליפים מובילים בישראל ובחו״ל, ומביאה לכל שיעור דיוק טכני לצד נוכחות בימתית. הגישה שלה מתמקדת באיזולציות נקיות ובסיפור שמאחורי כל תנועה.",
    specialties: ["קומרשל", "איזולציות", "נוכחות בימתית"],
    // Placeholder — replace with the teacher's real Instagram URL.
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "daniel-cohen",
    name: "דניאל כהן",
    role: "מורה להיפ הופ",
    bio: "דניאל מגיע מרקע של תחרויות היפ הופ בינלאומיות, ומלמד קומבינציות שמבוססות על גרוב, מוזיקליות וכוח קרקע. השיעורים שלו בנויים לפירוק שיטתי שמתאים גם לרקדנים שמתחילים להעמיק בסגנון.",
    specialties: ["היפ הופ", "גרוב", "מוזיקליות"],
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "noa-sagi",
    name: "נועה שגיא",
    role: "מורה להילס",
    bio: "נועה מתמחה בסגנון הילס עם דגש על שליטה, אורך קו ואומץ בימתי. היא מלמדת רקדנים ורקדניות בכל הרמות איך להרגיש בטוחים בעקב תוך שמירה על טכניקה מדויקת.",
    specialties: ["הילס", "שליטה בגוף", "ביטחון בימתי"],
    instagramUrl: "https://www.instagram.com/",
  },
];

export function getAllInstructors(): InstructorRecord[] {
  return INSTRUCTORS;
}

export function getInstructorBySlug(slug: string): InstructorRecord | undefined {
  return INSTRUCTORS.find((instructor) => instructor.slug === slug);
}
