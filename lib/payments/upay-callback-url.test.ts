import { describe, expect, it } from "vitest";
import {
  rewriteUpayCallbackUrl,
  rewriteUpayFormFields,
} from "@/lib/payments/upay-callback-url";
import { WORKER_ORIGIN } from "@/lib/site";

describe("rewriteUpayCallbackUrl", () => {
  it("rewrites localhost checkout returnurl to the Worker", () => {
    expect(
      rewriteUpayCallbackUrl(
        "http://localhost:4127/he/external-courses/vibe-on-heels?payment=success&provider=upay&purchaseId=08ca8a0f-baa4-4397-ba7e-6dff6bba1f70",
      ),
    ).toBe(
      `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels?payment=success&provider=upay&purchaseId=08ca8a0f-baa4-4397-ba7e-6dff6bba1f70`,
    );
  });

  it("keeps a live Worker https URL", () => {
    const live = `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels?payment=success`;
    expect(rewriteUpayCallbackUrl(live)).toBe(live);
  });

  it("rewrites the unwired placeholder domain", () => {
    expect(
      rewriteUpayCallbackUrl("https://theframebybarzilay.com/he/external-courses/vibe-on-heels"),
    ).toBe(`${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`);
  });
});

describe("rewriteUpayFormFields", () => {
  it("rewrites returnurl and ipnurl together", () => {
    expect(
      rewriteUpayFormFields({
        amount: "1.00",
        returnurl: "http://localhost:4127/he/external-courses/vibe-on-heels?payment=success",
        ipnurl: "http://127.0.0.1:4127/api/v1/webhooks/upay?purchaseId=x",
      }),
    ).toEqual({
      amount: "1.00",
      returnurl: `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels?payment=success`,
      ipnurl: `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=x`,
    });
  });
});
