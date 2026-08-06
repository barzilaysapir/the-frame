export interface InstructorRecord {
  slug: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
}

export const INSTRUCTORS: InstructorRecord[] = [
  {
    slug: "maya-azulai",
    name: "מאיה אזולאי",
    role: "מדריכת קומרשל",
    bio: "מאיה רקדה בהפקות קומרשל וקליפים מובילים בישראל ובחו״ל, ומביאה לכל שיעור דיוק טכני לצד נוכחות בימתית. הגישה שלה מתמקדת באיזולציות נקיות ובסיפור שמאחורי כל תנועה.",
    specialties: ["קומרשל", "איזולציות", "נוכחות בימתית"],
  },
  {
    slug: "daniel-cohen",
    name: "דניאל כהן",
    role: "מדריך היפ הופ",
    bio: "דניאל מגיע מרקע של תחרויות היפ הופ בינלאומיות, ומלמד קומבואים שמבוססים על גרוב, מוזיקליות וכוח קרקע. השיעורים שלו בנויים לפירוק שיטתי שמתאים גם לרקדנים שמתחילים להעמיק בסגנון.",
    specialties: ["היפ הופ", "גרוב", "מוזיקליות"],
  },
  {
    slug: "noa-sagi",
    name: "נועה שגיא",
    role: "מדריכת הילס",
    bio: "נועה מתמחה בסגנון הילס עם דגש על שליטה, אורך קו ואומץ בימתי. היא מלמדת רקדנים ורקדניות בכל הרמות איך להרגיש בטוחים בעקב תוך שמירה על טכניקה מדויקת.",
    specialties: ["הילס", "שליטה בגוף", "ביטחון בימתי"],
  },
];

export function getAllInstructors(): InstructorRecord[] {
  return INSTRUCTORS;
}

export function getInstructorBySlug(slug: string): InstructorRecord | undefined {
  return INSTRUCTORS.find((instructor) => instructor.slug === slug);
}
