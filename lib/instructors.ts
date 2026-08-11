/**
 * Instructor types + **temporary in-memory mock teachers**.
 * Replace with server/CMS fetches when the API is ready.
 */
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
  {
    slug: "tali-mizrahi",
    style: "jazz-funk",
    avatar: "/instructors/tali-mizrahi.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "yael-bar",
    style: "jazz-funk",
    avatar: "/instructors/yael-bar.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "oran-ben-david",
    style: "hip-hop",
    avatar: "/instructors/oran-ben-david.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "amit-sharabi",
    style: "hip-hop",
    avatar: "/instructors/amit-sharabi.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "maya-rozin",
    style: "heels",
    avatar: "/instructors/maya-rozin.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "noga-eliyahu",
    style: "heels",
    avatar: "/instructors/noga-eliyahu.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "yasmin-kadosh",
    style: "jazz",
    avatar: "/instructors/yasmin-kadosh.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "omer-tzur",
    style: "jazz",
    avatar: "/instructors/omer-tzur.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "hila-ben-ari",
    style: "jazz",
    avatar: "/instructors/hila-ben-ari.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "efrat-wolde",
    style: "afro",
    avatar: "/instructors/efrat-wolde.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "yonatan-tesfaye",
    style: "afro",
    avatar: "/instructors/yonatan-tesfaye.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "or-katz",
    style: "dancehall",
    avatar: "/instructors/or-katz.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "tamir-levy",
    style: "dancehall",
    avatar: "/instructors/tamir-levy.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "michal-buzaglo",
    style: "commercial",
    avatar: "/instructors/michal-buzaglo.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
  {
    slug: "guy-ravid",
    style: "commercial",
    avatar: "/instructors/guy-ravid.jpg",
    instagramUrl: "https://www.instagram.com/",
  },
];

export function getAllInstructors(): InstructorRecord[] {
  return INSTRUCTORS;
}

export function getInstructorBySlug(slug: string): InstructorRecord | undefined {
  return INSTRUCTORS.find((instructor) => instructor.slug === slug);
}
