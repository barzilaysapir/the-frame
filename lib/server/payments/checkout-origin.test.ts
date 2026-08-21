import { describe, expect, it } from "vitest";
import {
  isPublicHttpsOrigin,
  publicOriginFromRequest,
  upayCallbackOrigin,
} from "@/lib/server/payments/checkout-origin";

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
  const site = "https://theframebybarzilay.com";

  it("keeps a public https origin", () => {
    expect(
      upayCallbackOrigin("https://the-frame.barzilaysapir.workers.dev", site),
    ).toBe("https://the-frame.barzilaysapir.workers.dev");
  });

  it("does not send localhost http to uPay", () => {
    expect(upayCallbackOrigin("http://localhost:4127", site)).toBe(site);
    expect(upayCallbackOrigin("http://127.0.0.1:4127", site)).toBe(site);
  });

  it("does not send LAN http to uPay", () => {
    expect(upayCallbackOrigin("http://10.0.0.14:4127", site)).toBe(site);
  });
});

describe("isPublicHttpsOrigin", () => {
  it("accepts https workers.dev and rejects loopback", () => {
    expect(isPublicHttpsOrigin("https://example.workers.dev")).toBe(true);
    expect(isPublicHttpsOrigin("http://localhost:4127")).toBe(false);
    expect(isPublicHttpsOrigin("https://localhost")).toBe(false);
  });
});

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
