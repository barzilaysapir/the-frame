import { describe, expect, it } from "vitest";
import {
  bitAmountAllowed,
  buildUpayFormFields,
  formatUpayAmount,
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
    expect(form.fields.amount).toBe("200");
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
    expect(form.fields.amount).toBe("1");
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
    expect(form.fields.amount).toBe("200");
  });

  it("prefills a Latin invoice name and never sends buyer invoiceemail", () => {
    const form = buildUpayFormFields(
      config,
      params({
        payerName: "Sapir Barzilay",
      }),
    );
    expect(form.fields.invoicename).toBe("Sapir Barzilay");
    expect(form.fields.fullname).toBe("Sapir Barzilay");
    expect(form.fields.invoiceemail).toBeUndefined();
    expect(form.fields.payeremail).toBeUndefined();
    expect(form.fields.email).toBe("merchant@example.com");
  });

  it("omits Hebrew invoicename so uPay does not bounce", () => {
    const form = buildUpayFormFields(
      config,
      params({
        payerName: "ספיר ברזילי",
      }),
    );
    expect(form.fields.invoicename).toBeUndefined();
    expect(form.fields.fullname).toBeUndefined();
    expect(form.fields.invoiceemail).toBeUndefined();
  });
});

describe("formatUpayAmount", () => {
  it("sends whole shekels like the dashboard button", () => {
    expect(formatUpayAmount(1)).toBe("1");
    expect(formatUpayAmount(200)).toBe("200");
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
