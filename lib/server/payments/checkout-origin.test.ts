import { describe, expect, it } from "vitest";
import {
  isPublicHttpsOrigin,
  publicOriginFromRequest,
  shareOriginFromHeaders,
  upayCallbackOrigin,
} from "@/lib/server/payments/checkout-origin";
import { SITE_URL, WORKER_ORIGIN } from "@/lib/site";

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
  it("always uses the production Worker, including from preview", () => {
    expect(
      upayCallbackOrigin("https://the-frame.barzilaysapir.workers.dev"),
    ).toBe(WORKER_ORIGIN);
    expect(
      upayCallbackOrigin("https://preview-the-frame.barzilaysapir.workers.dev"),
    ).toBe(WORKER_ORIGIN);
    expect(upayCallbackOrigin("https://theframe.bybarzilay.com")).toBe(
      WORKER_ORIGIN,
    );
    expect(upayCallbackOrigin("http://localhost:4127")).toBe(WORKER_ORIGIN);
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
    const returnUrl = `${origin}/he/external-courses/vibe-on-heels`;
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

describe("shareOriginFromHeaders", () => {
  const previewHost =
    "cursor-whatsapp-share-image-44fa-the-frame.barzilaysapir.workers.dev";

  it("uses the forwarded preview host so og:image is fetchable before merge", () => {
    expect(
      shareOriginFromHeaders({
        host: previewHost,
        proto: "https",
      }),
    ).toBe(`https://${previewHost}`);
  });

  it("uses the first host when x-forwarded-host is a list", () => {
    expect(
      shareOriginFromHeaders({
        host: `${previewHost}, the-frame.barzilaysapir.workers.dev`,
        proto: "https, http",
      }),
    ).toBe(`https://${previewHost}`);
  });

  it("falls back to SITE_URL for localhost and missing host", () => {
    expect(shareOriginFromHeaders({ host: "localhost:4127" })).toBe(
      SITE_URL.replace(/\/$/, ""),
    );
    expect(shareOriginFromHeaders({})).toBe(SITE_URL.replace(/\/$/, ""));
  });

  it("upgrades http to https for public hosts", () => {
    expect(
      shareOriginFromHeaders({
        host: "preview-the-frame.barzilaysapir.workers.dev",
        proto: "http",
      }),
    ).toBe("https://preview-the-frame.barzilaysapir.workers.dev");
  });
});
