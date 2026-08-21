import { describe, expect, it } from "vitest";
import {
  isVerifiedPaidEntitlement,
  UNVERIFIED_UPAY_RETURN_ID,
} from "@/lib/payments/verified-paid";

describe("isVerifiedPaidEntitlement", () => {
  it("rejects the auto-confirm-on-return marker", () => {
    expect(isVerifiedPaidEntitlement(UNVERIFIED_UPAY_RETURN_ID)).toBe(false);
  });

  it("accepts IPN, admin, and other paid markers", () => {
    expect(isVerifiedPaidEntitlement("upay-ipn")).toBe(true);
    expect(isVerifiedPaidEntitlement(null)).toBe(true);
    expect(isVerifiedPaidEntitlement("manual")).toBe(true);
  });
});
