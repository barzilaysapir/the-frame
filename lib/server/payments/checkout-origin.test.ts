import { describe, expect, it } from "vitest";
import {
  isPublicHttpsOrigin,
  publicOriginFromRequest,
  upayCallbackOrigin,
} from "@/lib/server/payments/checkout-origin";
import { WORKER_ORIGIN } from "@/lib/site";

describe("publicOriginFromRequest", () => {
  it("uses the request URL when no forwarded headers are present", () => {
    expect(
      publicOriginFromRequest({
        url: "https://the-frame.barzilaysapir.workers.dev/api/v1/me/purchases",
      }),
    ).toBe("https://the-frame.barzilaysapir.workers.dev");
  });

  it("prefers x-forwarded-host/proto so callbacks match the public hostname", () => {
    expect(
      publicOriginFromRequest({
        url: "http://127.0.0.1:8787/api/v1/me/purchases",
        forwardedHost: "preview-the-frame.barzilaysapir.workers.dev",
        forwardedProto: "https",
      }),
    ).toBe("https://preview-the-frame.barzilaysapir.workers.dev");
  });
});

describe("upayCallbackOrigin", () => {
  it("keeps a public Worker origin", () => {
    expect(
      upayCallbackOrigin("https://the-frame.barzilaysapir.workers.dev"),
    ).toBe(WORKER_ORIGIN);
    expect(
      upayCallbackOrigin("https://preview-the-frame.barzilaysapir.workers.dev"),
    ).toBe("https://preview-the-frame.barzilaysapir.workers.dev");
  });

  it("keeps the future custom domain when that is the request host", () => {
    expect(upayCallbackOrigin("https://theframe.bybarzilay.com")).toBe(
      "https://theframe.bybarzilay.com",
    );
  });

  it("does not send localhost http to uPay", () => {
    expect(upayCallbackOrigin("http://localhost:4127")).toBe(WORKER_ORIGIN);
    expect(upayCallbackOrigin("http://127.0.0.1:4127")).toBe(WORKER_ORIGIN);
  });

  it("does not send LAN http to uPay", () => {
    expect(upayCallbackOrigin("http://10.0.0.14:4127")).toBe(WORKER_ORIGIN);
  });

  it("does not send the unwired placeholder domain to uPay", () => {
    expect(upayCallbackOrigin("https://theframebybarzilay.com")).toBe(
      WORKER_ORIGIN,
    );
  });

  it("builds a real https returnurl from local checkout", () => {
    const origin = upayCallbackOrigin("http://localhost:4127");
    const returnUrl = `${origin}/he/external-courses/vibe-on-heels?payment=success&provider=upay`;
    const parsed = new URL(returnUrl);
    expect(parsed.protocol).toBe("https:");
    expect(parsed.hostname).toBe("the-frame.barzilaysapir.workers.dev");
    expect(parsed.pathname).toBe("/he/external-courses/vibe-on-heels");
  });
});

describe("isPublicHttpsOrigin", () => {
  it("accepts https workers.dev and rejects loopback", () => {
    expect(isPublicHttpsOrigin("https://example.workers.dev")).toBe(true);
    expect(isPublicHttpsOrigin("http://localhost:4127")).toBe(false);
    expect(isPublicHttpsOrigin("https://localhost")).toBe(false);
  });
});
