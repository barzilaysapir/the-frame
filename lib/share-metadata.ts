import type { Metadata } from "next";
import { isPublicHttpsOrigin } from "@/lib/server/payments/checkout-origin";
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

function canonicalOrigin(): string {
  return SITE_URL.replace(/\/$/, "");
}

/**
 * Origin WhatsApp should fetch `og:image` from. PR / preview Worker
 * aliases serve this branch's assets (including `/og/default.jpg`); the
 * production host 404s those until the branch is merged. Prefer the
 * request host when it is a public https origin.
 */
export function shareOriginFromHeaders(input: {
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}): string {
  const host =
    input.forwardedHost?.split(",")[0]?.trim() ||
    input.host?.split(",")[0]?.trim();
  if (!host) return canonicalOrigin();
  const proto = input.forwardedProto?.split(",")[0]?.trim() || "https";
  const origin = `${proto}://${host}`.replace(/\/$/, "");
  const httpsOrigin = origin.replace(/^http:\/\//i, "https://");
  if (isPublicHttpsOrigin(httpsOrigin)) return httpsOrigin;
  return canonicalOrigin();
}

export async function resolveShareOrigin(): Promise<string> {
  try {
    const { connection } = await import("next/server");
    // Defer until a real request so PR/preview hosts are not baked as
    // production `SITE_URL` during prerender (that 404s `/og/default.jpg`).
    await connection();
    const { headers } = await import("next/headers");
    const headerList = await headers();
    return shareOriginFromHeaders({
      host: headerList.get("host"),
      forwardedHost: headerList.get("x-forwarded-host"),
      forwardedProto: headerList.get("x-forwarded-proto"),
    });
  } catch {
    return canonicalOrigin();
  }
}

/**
 * Resolve a `public/` path (or already-absolute URL) against `origin`.
 * WhatsApp's scraper rejects relative `og:image` URLs.
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
  const resolvedImage = resolveShareImage(image);
  const size = shareImageSizeForPath(resolvedImage);
  const images = shareImageFields({
    url: resolvedImage,
    alt: imageAlt ?? title,
    width: imageWidth ?? size.width,
    height: imageHeight ?? size.height,
    origin,
  });
  const imageUrl = absoluteAssetUrl(resolvedImage, origin);

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
