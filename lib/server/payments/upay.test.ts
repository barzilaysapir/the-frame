import { describe, expect, it } from "vitest";
import {
  bitAmountAllowed,
  buildUpayFormFields,
  isUpayPaymentMethod,
  UPAY_BIT_MAX_ILS,
  upayProviderForMethod,
} from "@/lib/server/payments/upay";

const config = { merchantEmail: "merchant@example.com" };

function params(overrides: Partial<Parameters<typeof buildUpayFormFields>[1]> = {}) {
  return {
    amountIls: 200,
    description: "Vibe on Heels",
    returnUrl: "https://example.com/ok",
    ipnUrl: "https://example.com/ipn",
    ...overrides,
  };
}

describe("buildUpayFormFields", () => {
  it("posts the server-computed amount to uPay's hosted form", () => {
    const form = buildUpayFormFields(config, params());

    expect(form.action).toBe(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
    );
    expect(form.fields.email).toBe("merchant@example.com");
    expect(form.fields.amount).toBe("200.00");
    expect(form.fields.paymentdetails).toBe("Vibe on Heels");
    expect(form.fields.paymentmethod).toBeUndefined();
  });

  it("adds paymentmethod=bit for the Bit checkout path", () => {
    const form = buildUpayFormFields(config, params({ method: "bit" }));

    expect(form.fields.paymentmethod).toBe("bit");
    expect(form.fields.amount).toBe("200.00");
  });
});

describe("upay Bit helpers", () => {
  it("accepts card and bit as payment methods", () => {
    expect(isUpayPaymentMethod("card")).toBe(true);
    expect(isUpayPaymentMethod("bit")).toBe(true);
    expect(isUpayPaymentMethod("paypal")).toBe(false);
  });

  it("caps Bit at ₪5,000", () => {
    expect(bitAmountAllowed(UPAY_BIT_MAX_ILS)).toBe(true);
    expect(bitAmountAllowed(UPAY_BIT_MAX_ILS + 1)).toBe(false);
  });

  it("stores a distinct provider for Bit vs card", () => {
    expect(upayProviderForMethod("card")).toBe("upay");
    expect(upayProviderForMethod("bit")).toBe("upay-bit");
  });
});
