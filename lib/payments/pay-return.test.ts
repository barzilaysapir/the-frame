import { describe, expect, it } from "vitest";
import {
  buildUpayBrowserReturnUrl,
  PAY_RETURN_FILE,
  sanitizePayReturnPath,
} from "@/lib/payments/pay-return";
import { WORKER_ORIGIN } from "@/lib/site";

describe("sanitizePayReturnPath", () => {
  it("keeps a locale-prefixed course path", () => {
    expect(sanitizePayReturnPath("/he/external-courses/vibe-on-heels")).toBe(
      "/he/external-courses/vibe-on-heels",
    );
  });

  it("strips query and hash from the destination", () => {
    expect(
      sanitizePayReturnPath("/he/external-courses/vibe-on-heels?payment=success#x"),
    ).toBe("/he/external-courses/vibe-on-heels");
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
  it("puts the destination in the hash on the static file", () => {
    expect(
      buildUpayBrowserReturnUrl("/he/external-courses/vibe-on-heels"),
    ).toBe(
      `${WORKER_ORIGIN}${PAY_RETURN_FILE}?next=${encodeURIComponent("/he/external-courses/vibe-on-heels")}#/he/external-courses/vibe-on-heels`,
    );
  });
});
