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
    expect(absoluteAssetUrl("/icon.png")).toBe(`${PRODUCTION_ORIGIN}/icon.png`);
  });

  it("leaves an already-absolute URL unchanged", async () => {
    const { absoluteAssetUrl } = await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(absoluteAssetUrl("https://cdn.example/cover.png")).toBe(
      "https://cdn.example/cover.png",
    );
  });
});

describe("courseShareImage", () => {
  it("uses dedicated course art", async () => {
    const { courseShareImage } = await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(courseShareImage("/course-covers/gisha-gmisha-foundations.jpg")).toBe(
      "/course-covers/gisha-gmisha-foundations.jpg",
    );
  });

  it("falls back to the brand mark for recycled routine posters", async () => {
    const { courseShareImage, DEFAULT_SHARE_IMAGE } =
      await loadShareMetadata(PRODUCTION_ORIGIN);
    expect(
      courseShareImage("/routine-posters/routine-poster-frame-studio.png"),
    ).toBe(DEFAULT_SHARE_IMAGE);
  });
});

describe("pageShareMetadata", () => {
  it("emits the brand mark for pages without dedicated cover art", async () => {
    const { pageShareMetadata, DEFAULT_SHARE_IMAGE } =
      await loadShareMetadata(PRODUCTION_ORIGIN);
    const metadata = pageShareMetadata({
      title: "Internal test — do not purchase",
      description: "Payment system test",
      image: DEFAULT_SHARE_IMAGE,
      imageAlt: "The Frame by Barzilay",
    });

    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    expect(images).toEqual([
      {
        url: `${PRODUCTION_ORIGIN}/icon.png`,
        secureUrl: `${PRODUCTION_ORIGIN}/icon.png`,
        alt: "The Frame by Barzilay",
        width: 867,
        height: 867,
        type: "image/png",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary",
      images: [`${PRODUCTION_ORIGIN}/icon.png`],
    });
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
});
