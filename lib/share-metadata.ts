import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/** Site-wide WhatsApp/Facebook share image (1200×630 JPEG). */
export const DEFAULT_SHARE_IMAGE = "/og/default.jpg";
export const DEFAULT_SHARE_IMAGE_WIDTH = 1200;
export const DEFAULT_SHARE_IMAGE_HEIGHT = 630;

/** Photo encoded into `DEFAULT_SHARE_IMAGE` — reuse the JPEG when sharing it. */
const DEFAULT_SHARE_IMAGE_SOURCE =
  "/routine-posters/routine-poster-frame-studio.png";

/** Catalog posters in `public/routine-posters/` are authored at 960×640. */
const POSTER_SHARE_IMAGE_WIDTH = 960;
const POSTER_SHARE_IMAGE_HEIGHT = 640;

/** Course covers in `public/course-covers/` are authored at 960×540. */
const COURSE_SHARE_IMAGE_WIDTH = 960;
const COURSE_SHARE_IMAGE_HEIGHT = 540;

/**
 * Resolve a `public/` path (or already-absolute URL) against the canonical
 * site origin. WhatsApp's scraper rejects relative `og:image` URLs, and
 * preview aliases send `X-Robots-Tag: noindex` on every asset — pointing
 * at the production origin keeps the image fetchable.
 */
export function absoluteAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = SITE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

/** Prefer the JPEG OG card when the catalog asset is the photo we encoded into it. */
function resolveShareImage(path: string): string {
  if (path === DEFAULT_SHARE_IMAGE_SOURCE) return DEFAULT_SHARE_IMAGE;
  return path;
}

/** Pixel size WhatsApp/Facebook should treat the asset as, based on where we store it. */
function shareImageSizeForPath(path: string): {
  width: number;
  height: number;
} {
  if (path === DEFAULT_SHARE_IMAGE || path.startsWith("/og/")) {
    return {
      width: DEFAULT_SHARE_IMAGE_WIDTH,
      height: DEFAULT_SHARE_IMAGE_HEIGHT,
    };
  }
  if (path.startsWith("/course-covers/")) {
    return {
      width: COURSE_SHARE_IMAGE_WIDTH,
      height: COURSE_SHARE_IMAGE_HEIGHT,
    };
  }
  return {
    width: POSTER_SHARE_IMAGE_WIDTH,
    height: POSTER_SHARE_IMAGE_HEIGHT,
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
  const resolvedImage = resolveShareImage(image);
  const size = shareImageSizeForPath(resolvedImage);
  const images = shareImageFields({
    url: resolvedImage,
    alt: imageAlt ?? title,
    width: imageWidth ?? size.width,
    height: imageHeight ?? size.height,
  });
  const imageUrl = absoluteAssetUrl(resolvedImage);

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
