import { describe, expect, it } from "vitest";
import {
  awsUriEncode,
  canPresignR2Playback,
  playbackStorageStatus,
  presignR2GetUrl,
  readR2PresignConfig,
  remainingPlaybackTtlSeconds,
  r2ObjectUrl,
  signAws4QueryGet,
} from "@/lib/server/r2-presign";

describe("readR2PresignConfig", () => {
  it("returns null when the S3 API token is missing", () => {
    expect(readR2PresignConfig({})).toBeNull();
    expect(
      readR2PresignConfig({ R2_ACCESS_KEY_ID: "id" }),
    ).toBeNull();
    expect(
      readR2PresignConfig({ R2_SECRET_ACCESS_KEY: "secret" }),
    ).toBeNull();
  });

  it("defaults account and bucket to this project's wrangler values", () => {
    expect(
      readR2PresignConfig({
        FRAME_R2_ACCESS_KEY_ID: " id ",
        FRAME_R2_SECRET_ACCESS_KEY: " secret ",
      }),
    ).toEqual({
      accessKeyId: "id",
      secretAccessKey: "secret",
      accountId: "8541729902392a145a03f97a906af16f",
      bucket: "the-frame",
    });
  });

  it("still accepts legacy R2_* secret names", () => {
    expect(
      readR2PresignConfig({
        R2_ACCESS_KEY_ID: "legacy-id",
        R2_SECRET_ACCESS_KEY: "legacy-secret",
      }),
    ).toMatchObject({
      accessKeyId: "legacy-id",
      secretAccessKey: "legacy-secret",
    });
  });
});

describe("playbackStorageStatus", () => {
  it("reports configured flags without exposing secret values", () => {
    expect(playbackStorageStatus({})).toEqual({
      r2ApiConfigured: false,
      r2PresignEnabled: true,
      videoSigningConfigured: false,
      r2AccessKeyConfigured: false,
      r2SecretKeyConfigured: false,
    });
    expect(
      playbackStorageStatus({
        FRAME_R2_ACCESS_KEY_ID: "id",
        FRAME_R2_SECRET_ACCESS_KEY: "secret",
        VIDEO_SIGNING_SECRET: "sign",
        R2_PRESIGN_PLAYBACK: "0",
      }),
    ).toEqual({
      r2ApiConfigured: true,
      r2PresignEnabled: false,
      videoSigningConfigured: true,
      r2AccessKeyConfigured: true,
      r2SecretKeyConfigured: true,
    });
    expect(
      canPresignR2Playback(
        playbackStorageStatus({
          FRAME_R2_ACCESS_KEY_ID: "id",
          FRAME_R2_SECRET_ACCESS_KEY: "secret",
        }),
      ),
    ).toBe(true);
    expect(canPresignR2Playback(playbackStorageStatus({}))).toBe(false);
  });
});

describe("remainingPlaybackTtlSeconds", () => {
  it("floors at 30s and defaults malformed exp to 60s", () => {
    expect(remainingPlaybackTtlSeconds("nope")).toBe(60);
    const exp = String(Math.floor(Date.now() / 1000) + 4000);
    expect(remainingPlaybackTtlSeconds(exp)).toBeGreaterThanOrEqual(30);
  });
});

describe("awsUriEncode", () => {
  it("keeps unreserved characters and optionally slashes", () => {
    expect(awsUriEncode("class-videos/foo.mp4", false)).toBe(
      "class-videos/foo.mp4",
    );
    expect(awsUriEncode("a b", true)).toBe("a%20b");
    expect(awsUriEncode("AKID/20130524/us-east-1/s3/aws4_request")).toBe(
      "AKID%2F20130524%2Fus-east-1%2Fs3%2Faws4_request",
    );
  });
});

describe("signAws4QueryGet", () => {
  // https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
  it("matches the AWS S3 GET example signature", async () => {
    const query = await signAws4QueryGet({
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      service: "s3",
      host: "examplebucket.s3.amazonaws.com",
      canonicalUri: "/test.txt",
      expiresInSeconds: 86400,
      now: new Date("2013-05-24T00:00:00.000Z"),
    });
    expect(query.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(query.get("X-Amz-Credential")).toBe(
      "AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request",
    );
    expect(query.get("X-Amz-Date")).toBe("20130524T000000Z");
    expect(query.get("X-Amz-Expires")).toBe("86400");
    expect(query.get("X-Amz-SignedHeaders")).toBe("host");
    expect(query.get("X-Amz-Signature")).toBe(
      "aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404",
    );
  });
});

describe("presignR2GetUrl", () => {
  const config = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    accountId: "8541729902392a145a03f97a906af16f",
    bucket: "the-frame",
  };
  const key = "class-videos/external-courses/gisha-gmisha/foundations/head-neck.mp4";

  it("builds a path-style R2 URL with only host-signed query params", async () => {
    const url = new URL(
      await presignR2GetUrl(config, key, 14400, new Date("2026-08-21T10:00:00.000Z")),
    );
    expect(url.origin).toBe(
      "https://8541729902392a145a03f97a906af16f.r2.cloudflarestorage.com",
    );
    expect(url.pathname).toBe(`/the-frame/${key}`);
    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("host");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("14400");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    expect(url.searchParams.has("X-Amz-Content-Sha256")).toBe(false);
  });

  it("does not encode slashes in the object key", () => {
    expect(r2ObjectUrl(config, `/${key}`)).toBe(
      `https://8541729902392a145a03f97a906af16f.r2.cloudflarestorage.com/the-frame/${key}`,
    );
  });

  it("changes the signature when the secret changes", async () => {
    const now = new Date("2026-08-21T10:00:00.000Z");
    const a = await presignR2GetUrl(config, key, 14400, now);
    const b = await presignR2GetUrl(
      { ...config, secretAccessKey: "other-secret" },
      key,
      14400,
      now,
    );
    expect(new URL(a).searchParams.get("X-Amz-Signature")).not.toBe(
      new URL(b).searchParams.get("X-Amz-Signature"),
    );
  });
});
