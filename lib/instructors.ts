import type { DanceStyleKey } from "@/lib/routines";

export interface InstructorRecord {
  slug: string;
  /** Stable style key — localized for display. */
  style: DanceStyleKey;
  /** MOCK portrait path under /public — replace with real photos when ready. */
  avatar: string;
  /** Public Instagram profile URL for this teacher. */
  instagramUrl: string;
}

export const INSTRUCTORS: InstructorRecord[] = [
  // MOCK teachers for demo UI — replace with real profiles when ready.
  {
    slug: "maya-azulai",
    style: "jazz-funk",
    avatar: "/instructors/maya-azulai.jpg",
    // Placeholder — replace with the teacher's real Instagram URL.
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "daniel-cohen",
    style: "hip-hop",
    avatar: "/instructors/daniel-cohen.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "noa-sagi",
    style: "heels",
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
