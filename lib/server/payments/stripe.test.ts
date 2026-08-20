import { describe, expect, it } from "vitest";
import {
  buildCheckoutSessionParams,
  flattenStripeParams,
  ilsToMinorUnits,
  paymentIntentId,
  sessionFulfillmentError,
  sessionPurchaseId,
  verifyStripeSignature,
  type StripeCheckoutSession,
} from "@/lib/server/payments/stripe";

const purchase = {
  amountIls: 200,
  status: "pending" as const,
  firebaseUid: "uid-1",
};

function paidSession(
  overrides: Partial<StripeCheckoutSession> = {},
): StripeCheckoutSession {
  return {
    id: "cs_test_1",
    payment_status: "paid",
    amount_total: 20000,
    currency: "ils",
    payment_intent: "pi_test_1",
    metadata: { purchaseId: "pur-1", firebaseUid: "uid-1" },
    client_reference_id: "pur-1",
    ...overrides,
  };
}

describe("ilsToMinorUnits", () => {
  it("converts whole shekels to agorot", () => {
    expect(ilsToMinorUnits(200)).toBe(20000);
    expect(ilsToMinorUnits(1)).toBe(100);
  });
});

describe("flattenStripeParams", () => {
  it("encodes nested Checkout Session fields the way Stripe's form API expects", () => {
    const params = flattenStripeParams({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ils",
            unit_amount: 20000,
            product_data: { name: "Heels 101" },
          },
        },
      ],
      metadata: { purchaseId: "abc" },
    });

    expect(params.get("mode")).toBe("payment");
    expect(params.get("line_items[0][quantity]")).toBe("1");
    expect(params.get("line_items[0][price_data][currency]")).toBe("ils");
    expect(params.get("line_items[0][price_data][unit_amount]")).toBe("20000");
    expect(params.get("line_items[0][price_data][product_data][name]")).toBe("Heels 101");
    expect(params.get("metadata[purchaseId]")).toBe("abc");
  });
});

describe("buildCheckoutSessionParams", () => {
  it("charges ILS from the server-computed amount and tags the purchase id", () => {
    const params = buildCheckoutSessionParams({
      amountIls: 99,
      description: "Vibe on Heels",
      successUrl: "https://example.com/ok?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://example.com/cancel",
      purchaseId: "pur-9",
      itemType: "external_course",
      itemSlug: "vibe-on-heels",
      firebaseUid: "uid-9",
      customerEmail: "buyer@example.com",
      locale: "he",
    });

    expect(params.mode).toBe("payment");
    expect(params.locale).toBe("he");
    expect(params.client_reference_id).toBe("pur-9");
    expect(params.customer_email).toBe("buyer@example.com");
    expect(params.metadata).toMatchObject({
      purchaseId: "pur-9",
      itemSlug: "vibe-on-heels",
      firebaseUid: "uid-9",
    });
    const lineItems = params.line_items as Array<{
      price_data: { currency: string; unit_amount: number };
    }>;
    expect(lineItems[0].price_data.currency).toBe("ils");
    expect(lineItems[0].price_data.unit_amount).toBe(9900);
  });
});

describe("sessionFulfillmentError", () => {
  it("accepts a paid ILS session that matches the stored purchase", () => {
    expect(sessionFulfillmentError(paidSession(), purchase)).toBeNull();
  });

  it("rejects unpaid sessions and amount/currency mismatches", () => {
    expect(
      sessionFulfillmentError(paidSession({ payment_status: "unpaid" }), purchase),
    ).toMatch(/not paid/);
    expect(
      sessionFulfillmentError(paidSession({ amount_total: 1 }), purchase),
    ).toMatch(/amount mismatch/);
    expect(
      sessionFulfillmentError(paidSession({ currency: "usd" }), purchase),
    ).toMatch(/currency mismatch/);
  });

  it("rejects a session that belongs to a different signed-in user", () => {
    expect(sessionFulfillmentError(paidSession(), purchase, "uid-other")).toMatch(
      /signed-in user/,
    );
  });
});

describe("session helpers", () => {
  it("prefers metadata.purchaseId and a payment_intent id string", () => {
    expect(sessionPurchaseId(paidSession())).toBe("pur-1");
    expect(
      sessionPurchaseId(paidSession({ metadata: null, client_reference_id: "fallback" })),
    ).toBe("fallback");
    expect(paymentIntentId(paidSession())).toBe("pi_test_1");
    expect(paymentIntentId(paidSession({ payment_intent: { id: "pi_obj" } }))).toBe(
      "pi_obj",
    );
    expect(paymentIntentId(paidSession({ payment_intent: null }))).toBe("cs_test_1");
  });
});

describe("verifyStripeSignature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({
    id: "evt_1",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_1" } },
  });
  const timestamp = 1_700_000_000;

  async function sign(body: string, t: number, key = secret): Promise<string> {
    const imported = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      imported,
      new TextEncoder().encode(`${t}.${body}`),
    );
    const hex = [...new Uint8Array(mac)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return `t=${t},v1=${hex}`;
  }

  it("accepts a valid v1 signature within tolerance", async () => {
    const header = await sign(payload, timestamp);
    const event = await verifyStripeSignature(payload, header, secret, timestamp);
    expect(event.id).toBe("evt_1");
    expect(event.type).toBe("checkout.session.completed");
  });

  it("rejects a missing or malformed header", async () => {
    await expect(verifyStripeSignature(payload, null, secret, timestamp)).rejects.toMatchObject(
      { status: 400 },
    );
    await expect(
      verifyStripeSignature(payload, "not-a-signature", secret, timestamp),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects the wrong secret, a stale timestamp, and a tampered body", async () => {
    const header = await sign(payload, timestamp);
    await expect(
      verifyStripeSignature(payload, header, "whsec_other", timestamp),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      verifyStripeSignature(payload, header, secret, timestamp + 301),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      verifyStripeSignature(`${payload} `, header, secret, timestamp),
    ).rejects.toMatchObject({ status: 400 });
  });
});
