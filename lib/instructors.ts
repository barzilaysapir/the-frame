export interface InstructorRecord {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** MOCK portrait path under /public — replace with real photos when ready. */
  avatar: string;
  /** Public Instagram profile URL for this teacher. */
  instagramUrl: string;
}

export const INSTRUCTORS: InstructorRecord[] = [
  // MOCK teachers for demo UI — replace with real profiles when ready.
  {
    slug: "maya-azulai",
    name: "מאיה אזולאי",
    role: "ג'אז פאנק",
    bio: "מלמדת ג'אז פאנק — גרוב ופרפורמנס.",
    avatar: "/instructors/maya-azulai.jpg",
    // Placeholder — replace with the teacher's real Instagram URL.
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "daniel-cohen",
    name: "דניאל כהן",
    role: "היפ הופ",
    bio: "מלמד היפ הופ — גרוב, מוזיקליות ופירוק שיטתי.",
    avatar: "/instructors/daniel-cohen.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "noa-sagi",
    name: "נועה שגיא",
    role: "עקבים",
    bio: "מלמדת עקבים — שליטה בעקב, אורך קו ופרפורמנס.",
    avatar: "/instructors/noa-sagi.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
];

export function getAllInstructors(): InstructorRecord[] {
  return INSTRUCTORS;
}

export function getInstructorBySlug(slug: string): InstructorRecord | undefined {
  return INSTRUCTORS.find((instructor) => instructor.slug === slug);
}
