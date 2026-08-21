import { describe, expect, it } from "vitest";
import { isUpayBitAccepted } from "@/lib/payments/upay-bit-response";

describe("isUpayBitAccepted", () => {
  it("rejects uPay POS error payloads", () => {
    expect(isUpayBitAccepted("error6:110")).toBe(false);
    expect(isUpayBitAccepted("wronginputphone")).toBe(false);
    expect(isUpayBitAccepted("")).toBe(false);
  });

  it("accepts a non-error body", () => {
    expect(isUpayBitAccepted('{"status":"ok"}')).toBe(true);
    expect(isUpayBitAccepted("ok")).toBe(true);
  });
});
