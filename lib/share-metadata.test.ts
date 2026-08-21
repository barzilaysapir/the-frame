import { afterEach, describe, expect, it, vi } from "vitest";

const PRODUCTION_ORIGIN = "https://the-frame.barzilaysapir.workers.dev";

async function loadShareMetadata(siteUrl?: string) {
  vi.resetModules();
  if (siteUrl === undefined) {
    vi.unstubAllEnvs();
  } else {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  }
  return import("./share-metadata");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("absoluteAssetUrl", () => {
  it("joins a public path onto the canonical site origin", async () => {
    const { absoluteAssetUrl } = await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(absoluteAssetUrl("/og/logo-horizontal.jpg")).toBe(
      `${PRODUCTION_ORIGIN}/og/logo-horizontal.jpg`,
    );
  });

  it("leaves an already-absolute URL unchanged", async () => {
    const { absoluteAssetUrl } = await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(absoluteAssetUrl("https://cdn.example/cover.png")).toBe(
      "https://cdn.example/cover.png",
    );
  });

  it("joins onto a request origin so preview Workers are not production 404s", async () => {
    const { absoluteAssetUrl } = await loadShareMetadata(PRODUCTION_ORIGIN);
    const preview = "https://cursor-whatsapp-share-image-44fa-the-frame.barzilaysapir.workers.dev";
    expect(absoluteAssetUrl("/og/logo-horizontal.jpg", preview)).toBe(
      `${preview}/og/logo-horizontal.jpg`,
    );
  });
});

describe("pageShareMetadata", () => {
  it("emits the full brand lockup for chrome pages", async () => {
    const { pageShareMetadata, DEFAULT_SHARE_IMAGE } =
      await loadShareMetadata(PRODUCTION_ORIGIN);
    const metadata = pageShareMetadata({
      title: "The Frame by Barzilay",
      description: "Learn the combo",
      image: DEFAULT_SHARE_IMAGE,
      imageAlt: "The Frame by Barzilay",
      origin: "https://preview-the-frame.barzilaysapir.workers.dev",
    });

    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    expect(images).toEqual([
      {
        url: "https://preview-the-frame.barzilaysapir.workers.dev/og/logo-horizontal.jpg",
        secureUrl:
          "https://preview-the-frame.barzilaysapir.workers.dev/og/logo-horizontal.jpg",
        alt: "The Frame by Barzilay",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [
        "https://preview-the-frame.barzilaysapir.workers.dev/og/logo-horizontal.jpg",
      ],
    });
  });

  it("uses a course cover, including recycled routine posters", async () => {
    const { pageShareMetadata } = await loadShareMetadata(PRODUCTION_ORIGIN);
    const metadata = pageShareMetadata({
      title: "Internal test — do not purchase",
      description: "Payment system test",
      image: "/routine-posters/routine-poster-frame-studio.png",
      imageAlt: "Internal test — do not purchase",
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        url: `${PRODUCTION_ORIGIN}/routine-posters/routine-poster-frame-studio.png`,
        secureUrl: `${PRODUCTION_ORIGIN}/routine-posters/routine-poster-frame-studio.png`,
        alt: "Internal test — do not purchase",
        width: 960,
        height: 640,
        type: "image/png",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
    });
  });

  it("keeps dedicated course art as the share image", async () => {
    const { pageShareMetadata } = await loadShareMetadata(PRODUCTION_ORIGIN);
    const metadata = pageShareMetadata({
      title: "Gisha Gmisha",
      description: "Foundations",
      image: "/course-covers/gisha-gmisha-foundations.jpg",
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        url: `${PRODUCTION_ORIGIN}/course-covers/gisha-gmisha-foundations.jpg`,
        secureUrl: `${PRODUCTION_ORIGIN}/course-covers/gisha-gmisha-foundations.jpg`,
        alt: "Gisha Gmisha",
        width: 960,
        height: 540,
        type: "image/jpeg",
      },
    ]);
  });
});
