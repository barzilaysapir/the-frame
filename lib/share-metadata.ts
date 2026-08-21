import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Site-wide share image: full lockup (mark + wordmark) at 1200×630.
 * Course and lesson pages override this with their own cover.
 */
export const DEFAULT_SHARE_IMAGE = "/og/logo-silhouette-hq.jpg";
export const DEFAULT_SHARE_IMAGE_WIDTH = 1200;
export const DEFAULT_SHARE_IMAGE_HEIGHT = 630;

/** Catalog posters in `public/routine-posters/` are authored at 960×640. */
const POSTER_SHARE_IMAGE_WIDTH = 960;
const POSTER_SHARE_IMAGE_HEIGHT = 640;

/** Course covers in `public/course-covers/` are authored at 960×540. */
const COURSE_SHARE_IMAGE_WIDTH = 960;
const COURSE_SHARE_IMAGE_HEIGHT = 540;

/**
 * Resolve a `public/` path against `origin`. WhatsApp rejects relative
 * `og:image` URLs and fetches that host, not the page URL — so preview
 * deploys must pass the request origin, not production `SITE_URL`.
 */
export function absoluteAssetUrl(
  path: string,
  origin: string = SITE_URL,
): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = origin.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

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
  origin?: string;
}): NonNullable<NonNullable<Metadata["openGraph"]>["images"]> {
  const url = absoluteAssetUrl(image.url, image.origin);
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
  origin,
}: {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  origin?: string;
}): Metadata {
  const size = shareImageSizeForPath(image);
  const images = shareImageFields({
    url: image,
    alt: imageAlt ?? title,
    width: imageWidth ?? size.width,
    height: imageHeight ?? size.height,
    origin,
  });
  const imageUrl = absoluteAssetUrl(image, origin);

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
