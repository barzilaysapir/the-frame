/**
 * The Frame's own social accounts (not per-instructor Instagram, which
 * lives alongside each instructor in `lib/instructors.ts`). No real handles
 * exist yet — each link stays unset, and therefore hidden, until its
 * NEXT_PUBLIC_* env var is set to a real profile URL.
 */
export type SocialPlatform = "instagram" | "tiktok" | "youtube";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export const SOCIAL_PLATFORM_NAMES: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const rawLinks: Record<SocialPlatform, string | undefined> = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL,
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
};

export const SOCIAL_LINKS: SocialLink[] = (
  Object.entries(rawLinks) as [SocialPlatform, string | undefined][]
)
  .filter((entry): entry is [SocialPlatform, string] => Boolean(entry[1]))
  .map(([platform, url]) => ({ platform, url }));
