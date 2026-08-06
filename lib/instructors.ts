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
  // MOCK teachers for demo UI — replace with real profiles when ready.
  {
    slug: "maya-azulai",
    name: "מאיה אזולאי",
    role: "ג'אז פאנק",
    bio: "רקדנית ג'אז פאנק בהפקות וקליפים, עם דגש על איזולציות נקיות ונוכחות בימתית.",
    specialties: ["ג'אז פאנק", "איזולציות", "נוכחות בימתית"],
    // Placeholder — replace with the teacher's real Instagram URL.
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "daniel-cohen",
    name: "דניאל כהן",
    role: "היפ הופ",
    bio: "רקע מתחרויות היפ הופ בינלאומיות — גרוב, מוזיקליות ופירוק שיטתי.",
    specialties: ["היפ הופ", "גרוב", "מוזיקליות"],
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "noa-sagi",
    name: "נועה שגיא",
    role: "עקבים",
    bio: "מתמחה בעקבים: שליטה בעקב, אורך קו וביטחון על הבמה בכל הרמות.",
    specialties: ["עקבים", "שליטה בגוף", "ביטחון בימתי"],
    instagramUrl: "https://www.instagram.com/",
  },
];

export function getAllInstructors(): InstructorRecord[] {
  return INSTRUCTORS;
}

export function getInstructorBySlug(slug: string): InstructorRecord | undefined {
  return INSTRUCTORS.find((instructor) => instructor.slug === slug);
}
