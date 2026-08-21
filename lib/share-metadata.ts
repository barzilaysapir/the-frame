import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Site-wide share image. Must already exist on the production Worker —
 * Facebook/WhatsApp fetch `og:image` from this absolute URL, and a file
 * that only lives on a PR preview (like a newly added `/og/…` JPEG) 404s.
 */
export const DEFAULT_SHARE_IMAGE =
  "/routine-posters/routine-poster-frame-studio.png";
export const DEFAULT_SHARE_IMAGE_WIDTH = 960;
export const DEFAULT_SHARE_IMAGE_HEIGHT = 640;

/** Course covers in `public/course-covers/` are authored at 960×540. */
const COURSE_SHARE_IMAGE_WIDTH = 960;
const COURSE_SHARE_IMAGE_HEIGHT = 540;

/**
 * Resolve a `public/` path against the canonical site origin. WhatsApp
 * rejects relative `og:image` URLs; it fetches this host, not the page URL.
 */
export function absoluteAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = SITE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

function shareImageSizeForPath(path: string): {
  width: number;
  height: number;
} {
  if (path.startsWith("/course-covers/")) {
    return {
      width: COURSE_SHARE_IMAGE_WIDTH,
      height: COURSE_SHARE_IMAGE_HEIGHT,
    };
  }
  return {
    width: DEFAULT_SHARE_IMAGE_WIDTH,
    height: DEFAULT_SHARE_IMAGE_HEIGHT,
  };
}

function mimeTypeForPath(path: string): string | undefined {
  const clean = path.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  return undefined;
}

export function shareImageFields(image: {
  url: string;
  alt: string;
  width: number;
  height: number;
}): NonNullable<NonNullable<Metadata["openGraph"]>["images"]> {
  const url = absoluteAssetUrl(image.url);
  const type = mimeTypeForPath(image.url);
  return [
    {
      url,
      secureUrl: url,
      alt: image.alt,
      width: image.width,
      height: image.height,
      ...(type ? { type } : {}),
    },
  ];
}

/**
 * Title, description, and a large share image for Open Graph / Twitter.
 * Child `openGraph.images` replace the layout default (see locale layout).
 */
export function pageShareMetadata({
  title,
  description,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
}: {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}): Metadata {
  const size = shareImageSizeForPath(image);
  const images = shareImageFields({
    url: image,
    alt: imageAlt ?? title,
    width: imageWidth ?? size.width,
    height: imageHeight ?? size.height,
  });
  const imageUrl = absoluteAssetUrl(image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
