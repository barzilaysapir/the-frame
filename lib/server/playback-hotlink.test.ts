import { describe, expect, it } from "vitest";
import {
  isInPageMediaRequest,
  isTrustedPlaybackHost,
} from "@/lib/server/playback-hotlink";

describe("isTrustedPlaybackHost", () => {
  it("allows this project's Worker hosts and local dev", () => {
    expect(isTrustedPlaybackHost("the-frame.barzilaysapir.workers.dev")).toBe(
      true,
    );
    expect(
      isTrustedPlaybackHost("preview-the-frame.barzilaysapir.workers.dev"),
    ).toBe(true);
    expect(isTrustedPlaybackHost("localhost:4127")).toBe(true);
    expect(isTrustedPlaybackHost("127.0.0.1:4127")).toBe(true);
  });

  it("rejects unrelated hosts", () => {
    expect(isTrustedPlaybackHost("evil.example")).toBe(false);
    expect(isTrustedPlaybackHost("r2.cloudflarestorage.com")).toBe(false);
  });
});

describe("isInPageMediaRequest", () => {
  it("allows same-origin fetch metadata from the player", () => {
    expect(
      isInPageMediaRequest({ secFetchSite: "same-origin" }),
    ).toBe(true);
  });

  it("allows a trusted Referer when Sec-Fetch is missing", () => {
    expect(
      isInPageMediaRequest({
        referer:
          "https://the-frame.barzilaysapir.workers.dev/he/external-courses/gisha",
      }),
    ).toBe(true);
  });

  it("rejects a bare stream GET (curl / new tab)", () => {
    expect(isInPageMediaRequest({})).toBe(false);
    expect(
      isInPageMediaRequest({ referer: "https://google.com/" }),
    ).toBe(false);
  });
});
