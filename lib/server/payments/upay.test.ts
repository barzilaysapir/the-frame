import { describe, expect, it, vi } from "vitest";
import {
  bitAmountAllowed,
  buildUpayFormFields,
  isUpayPaymentMethod,
  requestUpayBitCharge,
  UPAY_BIT_MAX_ILS,
  UPAY_DASHBOARD_MERCHANT_EMAIL,
  UPAY_JSON_URL,
  upayBitRequestFailed,
  upayProviderForMethod,
} from "@/lib/server/payments/upay";
import { WORKER_ORIGIN } from "@/lib/site";

const config = { merchantEmail: "merchant@example.com" };

function params(overrides: Partial<Parameters<typeof buildUpayFormFields>[1]> = {}) {
  return {
    amountIls: 200,
    description: "Vibe on Heels",
    returnUrl: `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`,
    ipnUrl: `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=abc`,
    ...overrides,
  };
}

describe("buildUpayFormFields", () => {
  it("posts a live amount plus production callbacks", () => {
    const form = buildUpayFormFields(config, params());

    expect(form.action).toBe(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
    );
    expect(form.fields.email).toBe("merchant@example.com");
    expect(form.fields.amount).toBe("200.00");
    expect(form.fields.returnurl).toBe(
      `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`,
    );
    expect(form.fields.ipnurl).toBe(
      `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=abc`,
    );
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
  });

  it("rewrites localhost callbacks onto the production Worker", () => {
    const form = buildUpayFormFields(
      config,
      params({
        returnUrl: "http://localhost:4127/he/external-courses/vibe-on-heels",
        ipnUrl: "http://127.0.0.1:4127/api/v1/webhooks/upay?purchaseId=abc",
      }),
    );
    expect(form.fields.returnurl).toBe(
      `${WORKER_ORIGIN}/he/external-courses/vibe-on-heels`,
    );
    expect(form.fields.ipnurl).toBe(
      `${WORKER_ORIGIN}/api/v1/webhooks/upay?purchaseId=abc`,
    );
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

describe("upayBitRequestFailed", () => {
  it("rejects HTTP errors and uPay wronginput bodies", () => {
    expect(upayBitRequestFailed("ok", 500)).toMatch(/failed \(500\)/);
    expect(upayBitRequestFailed("wronginputprovidername", 200)).toBe(
      "wronginputprovidername",
    );
    expect(upayBitRequestFailed('{"success":false,"error":"nope"}', 200)).toBe(
      "nope",
    );
  });

  it("accepts empty 200 and success JSON", () => {
    expect(upayBitRequestFailed("", 200)).toBeNull();
    expect(upayBitRequestFailed('{"success":true}', 200)).toBeNull();
  });
});

describe("requestUpayBitCharge", () => {
  it("POSTs json.php instead of the hosted card page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    await requestUpayBitCharge(
      config,
      params({ method: "bit", payerPhone: "0501234567" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(UPAY_JSON_URL);
    expect(init.method).toBe("POST");
    const body = String(init.body);
    expect(body).toContain("providername=bit");
    expect(body).toContain("cellphone=0501234567");
    expect(body).not.toContain("redirectpage.php");

    vi.unstubAllGlobals();
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
