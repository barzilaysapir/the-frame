import { describe, expect, it } from "vitest";
import {
  bitAmountAllowed,
  buildUpayFormFields,
  isUpayPaymentMethod,
  UPAY_BIT_MAX_ILS,
  UPAY_DASHBOARD_MERCHANT_EMAIL,
  upayProviderForMethod,
} from "@/lib/server/payments/upay";

const config = { merchantEmail: "merchant@example.com" };

function params(overrides: Partial<Parameters<typeof buildUpayFormFields>[1]> = {}) {
  return {
    amountIls: 200,
    description: "Vibe on Heels",
    ...overrides,
  };
}

describe("buildUpayFormFields", () => {
  it("matches the dashboard button, with a live amount", () => {
    const form = buildUpayFormFields(config, params());

    expect(form.action).toBe(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
    );
    expect(form.fields.email).toBe("merchant@example.com");
    expect(form.fields.amount).toBe("200.00");
    expect(form.fields.returnurl).toBe("");
    expect(form.fields.ipnurl).toBe("");
    expect(form.fields.paymentdetails).toBe("Vibe on Heels");
    expect(form.fields.paymentmethod).toBeUndefined();
    expect(form.fields.providername).toBeUndefined();
  });

  it("uses the dashboard merchant email", () => {
    const form = buildUpayFormFields(
      { merchantEmail: UPAY_DASHBOARD_MERCHANT_EMAIL },
      params({ amountIls: 1, description: "The Frame" }),
    );
    expect(form.fields.email).toBe("theframe@bybarzilay.com");
    expect(form.fields.amount).toBe("1.00");
    expect(form.fields.returnurl).toBe("");
    expect(form.fields.ipnurl).toBe("");
  });

  it("adds providername=bit and the buyer’s mobile for Bit", () => {
    const form = buildUpayFormFields(
      config,
      params({ method: "bit", payerPhone: "0501234567" }),
    );

    expect(form.fields.providername).toBe("bit");
    expect(form.fields.paymentmethod).toBeUndefined();
    expect(form.fields.phone).toBeUndefined();
    expect(form.fields.cellphone).toBe("0501234567");
    expect(form.fields.cellphonenotify).toBe("0501234567");
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
