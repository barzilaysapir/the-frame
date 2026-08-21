import { describe, expect, it } from "vitest";
import {
  buildUpayBrowserReturnUrl,
  buildUpayIpnUrl,
  sanitizePayReturnPath,
} from "@/lib/payments/pay-return";
import { WORKER_ORIGIN } from "@/lib/site";

describe("sanitizePayReturnPath", () => {
  it("keeps a locale-prefixed course path", () => {
    expect(sanitizePayReturnPath("/he/external-courses/vibe-on-heels")).toBe(
      "/he/external-courses/vibe-on-heels",
    );
  });

  it("strips query, hash, and uPay &error suffixes", () => {
    expect(
      sanitizePayReturnPath("/he/external-courses/vibe-on-heels?payment=success#x"),
    ).toBe("/he/external-courses/vibe-on-heels");
    expect(
      sanitizePayReturnPath(
        "/he/external-courses/gisha-gmisha-foundations&errormessage=USER_NOT_EXISTS",
      ),
    ).toBe("/he/external-courses/gisha-gmisha-foundations");
  });

  it("rejects open redirects", () => {
    expect(sanitizePayReturnPath("https://evil.example/he")).toBe("/he");
    expect(sanitizePayReturnPath("//evil.example/he")).toBe("/he");
    expect(sanitizePayReturnPath("/he/../en")).toBe("/he");
    expect(sanitizePayReturnPath("/fr/routines")).toBe("/he");
    expect(sanitizePayReturnPath("/")).toBe("/he");
  });
});

describe("buildUpayBrowserReturnUrl", () => {
  it("returns the production course URL with no extra query", () => {
    expect(
      buildUpayBrowserReturnUrl("/he/external-courses/gisha-gmisha-foundations"),
    ).toBe(`${WORKER_ORIGIN}/he/external-courses/gisha-gmisha-foundations`);
  });
});

describe("buildUpayIpnUrl", () => {
  it("points at the production webhook with the purchase id", () => {
    expect(buildUpayIpnUrl("abc-123")).toBe(
      `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=abc-123`,
    );
  });
});
