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
    expect(absoluteAssetUrl("/og/default.jpg")).toBe(
      `${PRODUCTION_ORIGIN}/og/default.jpg`,
    );
  });

  it("leaves an already-absolute URL unchanged", async () => {
    const { absoluteAssetUrl } = await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(absoluteAssetUrl("https://cdn.example/cover.png")).toBe(
      "https://cdn.example/cover.png",
    );
  });
});

describe("pageShareMetadata", () => {
  it("emits an absolute og:image so WhatsApp can fetch the thumbnail", async () => {
    const { pageShareMetadata } = await loadShareMetadata(PRODUCTION_ORIGIN);
    const metadata = pageShareMetadata({
      title: "Internal test — do not purchase",
      description: "Payment system test",
      image: "/routine-posters/routine-poster-frame-studio.png",
      imageAlt: "Internal test — do not purchase",
    });

    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    expect(images).toEqual([
      {
        url: `${PRODUCTION_ORIGIN}/og/default.jpg`,
        secureUrl: `${PRODUCTION_ORIGIN}/og/default.jpg`,
        alt: "Internal test — do not purchase",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [`${PRODUCTION_ORIGIN}/og/default.jpg`],
    });
    expect(metadata.openGraph?.title).toBe("Internal test — do not purchase");
    expect(metadata.openGraph?.description).toBe("Payment system test");
  });

  it("keeps a distinct course cover as the share image", async () => {
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

  it("sizes the default JPEG share card at 1200×630", async () => {
    const { pageShareMetadata, DEFAULT_SHARE_IMAGE } = await loadShareMetadata(
      PRODUCTION_ORIGIN,
    );
    const metadata = pageShareMetadata({
      title: "The Frame by Barzilay",
      description: "Learn the combo",
      image: DEFAULT_SHARE_IMAGE,
    });
    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    if (!Array.isArray(images)) return;
    expect(images[0]).toMatchObject({
      url: `${PRODUCTION_ORIGIN}/og/default.jpg`,
      width: 1200,
      height: 630,
      type: "image/jpeg",
    });
  });
});
