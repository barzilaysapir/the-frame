import { describe, expect, it } from "vitest";
import {
  rewriteUpayCallbackUrl,
  rewriteUpayFormFields,
} from "@/lib/payments/upay-callback-url";
import { WORKER_ORIGIN } from "@/lib/site";

describe("rewriteUpayCallbackUrl", () => {
  it("leaves a blank returnurl blank", () => {
    expect(rewriteUpayCallbackUrl("")).toBe("");
    expect(rewriteUpayCallbackUrl("   ")).toBe("");
  });

  it("rewrites localhost checkout returnurl to the Worker", () => {
    expect(
      rewriteUpayCallbackUrl(
        "http://localhost:4127/he/external-courses/vibe-on-heels",
      ),
    ).toBe(`${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`);
  });

  it("keeps the production Worker https URL", () => {
    const live = `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`;
    expect(rewriteUpayCallbackUrl(live)).toBe(live);
  });

  it("rewrites the preview Worker alias onto the production Worker", () => {
    expect(
      rewriteUpayCallbackUrl(
        "https://preview-the-frame.barzilaysapir.workers.dev/he/external-courses/vibe-on-heels",
      ),
    ).toBe(`${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`);
  });

  it("rewrites the unwired placeholder domain", () => {
    expect(
      rewriteUpayCallbackUrl("https://theframebybarzilay.com/he/external-courses/vibe-on-heels"),
    ).toBe(`${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`);
  });
});

describe("rewriteUpayFormFields", () => {
  it("leaves blank dashboard callbacks blank", () => {
    expect(
      rewriteUpayFormFields({
        amount: "1.00",
        returnurl: "",
        ipnurl: "",
      }),
    ).toEqual({
      amount: "1.00",
      returnurl: "",
      ipnurl: "",
    });
  });

  it("rewrites returnurl and ipnurl together", () => {
    expect(
      rewriteUpayFormFields({
        amount: "1.00",
        returnurl: "http://localhost:4127/he/external-courses/vibe-on-heels",
        ipnurl: "http://127.0.0.1:4127/api/v1/webhooks/upay?purchaseId=x",
      }),
    ).toEqual({
      amount: "1.00",
      returnurl: `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`,
      ipnurl: `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=x`,
    });
  });
});
