import { describe, expect, it } from "vitest";
import {
  mintPlaybackGateValue,
  playbackGateSetCookie,
  verifyPlaybackGateValue,
} from "@/lib/server/playback-hotlink";

async function testKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("test-playback-gate"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

describe("playback gate cookie", () => {
  it("accepts a value minted for a future expiry", async () => {
    const key = await testKey();
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const value = await mintPlaybackGateValue(key, expiresAt);
    expect(await verifyPlaybackGateValue(key, value)).toBe(true);
  });

  it("rejects a missing, expired, or foreign signature", async () => {
    const key = await testKey();
    const other = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("other"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    expect(await verifyPlaybackGateValue(key, undefined)).toBe(false);
    expect(await verifyPlaybackGateValue(key, "not-a-gate")).toBe(false);
    const expired = await mintPlaybackGateValue(key, Math.floor(Date.now() / 1000) - 10);
    expect(await verifyPlaybackGateValue(key, expired)).toBe(false);
    const value = await mintPlaybackGateValue(other, Math.floor(Date.now() / 1000) + 3600);
    expect(await verifyPlaybackGateValue(key, value)).toBe(false);
  });

  it("sets a host-scoped api cookie", () => {
    expect(
      playbackGateSetCookie("1.sig", Math.floor(Date.now() / 1000) + 60, "https://example.com/x"),
    ).toMatch(/Path=\/api\/v1/);
    expect(
      playbackGateSetCookie("1.sig", Math.floor(Date.now() / 1000) + 60, "https://example.com/x"),
    ).toMatch(/Secure/);
    expect(
      playbackGateSetCookie("1.sig", Math.floor(Date.now() / 1000) + 60, "http://localhost:4127/x"),
    ).not.toMatch(/Secure/);
  });
});
