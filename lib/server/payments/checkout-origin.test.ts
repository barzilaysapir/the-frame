import { describe, expect, it } from "vitest";
import { publicOriginFromRequest } from "@/lib/server/payments/checkout-origin";

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
