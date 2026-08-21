import { describe, expect, it } from "vitest";
import { upaySafeInvoiceName } from "@/lib/payments/upay-invoice-name";

describe("upaySafeInvoiceName", () => {
  it("keeps a Latin invoice name", () => {
    expect(upaySafeInvoiceName("Sapir Barzilay")).toBe("Sapir Barzilay");
  });

  it("drops Hebrew so uPay does not bounce with wronginputinvoicename", () => {
    expect(upaySafeInvoiceName("ספיר ברזילי")).toBeNull();
  });

  it("drops mixed Hebrew/Latin names", () => {
    expect(upaySafeInvoiceName("Sapir ברזילי")).toBeNull();
  });

  it("trims extra spaces", () => {
    expect(upaySafeInvoiceName("  Sapir   Barzilay  ")).toBe("Sapir Barzilay");
  });

  it("drops an empty name", () => {
    expect(upaySafeInvoiceName("   ")).toBeNull();
  });
});
