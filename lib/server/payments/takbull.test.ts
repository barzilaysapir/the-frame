import { describe, expect, it } from "vitest";
import {
  amountsMatchIls,
  buildPaymentPageRequest,
  isTakbullApproved,
  parseTakbullIpn,
  parseValidateResult,
  validationFulfillmentError,
} from "@/lib/server/payments/takbull";

describe("buildPaymentPageRequest", () => {
  it("sends the server-computed ILS amount and purchase id as order_reference", () => {
    const body = buildPaymentPageRequest({
      purchaseId: "pur-1",
      amountIls: 200,
      description: "Vibe on Heels",
      successUrl: "https://example.com/ok",
      cancelUrl: "https://example.com/cancel",
      ipnUrl: "https://example.com/ipn",
      locale: "he",
    });

    expect(body.order_reference).toBe("pur-1");
    expect(body.OrderTotalSum).toBe(200);
    expect(body.Currency).toBe("ILS");
    expect(body.Language).toBe("he");
    expect(body.DisplayType).toBe("redirect");
    expect(body.PaymentMethodType).toBeUndefined();
    expect(body.Products).toEqual([
      { ProductName: "Vibe on Heels", Price: 200, Quantity: 1 },
    ]);
  });
});

describe("parseTakbullIpn", () => {
  it("reads ids from JSON-style objects and query params", () => {
    expect(
      parseTakbullIpn({
        order_reference: "pur-1",
        uniqId: "A1B2",
      }),
    ).toEqual({ purchaseId: "pur-1", uniqId: "A1B2" });

    expect(
      parseTakbullIpn(new URLSearchParams("purchaseId=pur-9&UniqId=XYZ")),
    ).toEqual({ purchaseId: "pur-9", uniqId: "XYZ" });
  });
});

describe("validationFulfillmentError", () => {
  const purchase = { amountIls: 200, status: "pending" as const };

  it("accepts an approved ILS validate payload that matches the stored amount", () => {
    expect(
      validationFulfillmentError(
        { status: "Approved", amount: 200, currency: "ILS", transactionId: "TX1" },
        purchase,
      ),
    ).toBeNull();
  });

  it("rejects unpaid, mismatched amount, and non-ILS currency", () => {
    expect(
      validationFulfillmentError(
        { status: "Pending", amount: 200, currency: "ILS", transactionId: "TX1" },
        purchase,
      ),
    ).toMatch(/status/i);
    expect(
      validationFulfillmentError(
        { status: "Approved", amount: 1, currency: "ILS", transactionId: "TX1" },
        purchase,
      ),
    ).toMatch(/amount mismatch/);
    expect(
      validationFulfillmentError(
        { status: "Approved", amount: 200, currency: "USD", transactionId: "TX1" },
        purchase,
      ),
    ).toMatch(/currency mismatch/);
  });
});

describe("parseValidateResult / helpers", () => {
  it("reads Approved + Amount from Takbull's validate payload", () => {
    expect(
      parseValidateResult({
        Status: "Approved",
        Amount: 150.77,
        Currency: "ILS",
        TransactionId: "TX987",
      }),
    ).toEqual({
      status: "Approved",
      amount: 150.77,
      currency: "ILS",
      transactionId: "TX987",
    });
  });

  it("treats Approved/1 as paid and compares ILS amounts in agorot", () => {
    expect(isTakbullApproved("Approved")).toBe(true);
    expect(isTakbullApproved("1")).toBe(true);
    expect(isTakbullApproved("Pending")).toBe(false);
    expect(amountsMatchIls(200, 200)).toBe(true);
    expect(amountsMatchIls(200, 200.004)).toBe(true);
    expect(amountsMatchIls(200, 199.5)).toBe(false);
  });
});
