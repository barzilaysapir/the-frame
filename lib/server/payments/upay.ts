import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * uPay (upay.co.il) hosted-checkout client.
 *
 * ⚠️ UNCONFIRMED API SHAPE — READ BEFORE TOUCHING THIS FILE ⚠️
 *
 * Unlike Grow/Meshulam (which publishes a documented "Light API" at
 * developers.grow.business), uPay (upay.co.il — the Israeli card-clearing
 * service, NOT the unrelated upaybr.com/upayments.com companies) does not
 * publish any public REST API reference. Their public site only documents:
 *   - A dashboard/mobile app for manual charges
 *   - Payment-request links sent via SMS/WhatsApp/email/QR
 *   - Plugins for WordPress/Magento/Joomla and a Shopify app
 * There is no public "create a hosted checkout session" or "webhook payload
 * shape" documentation for a custom (non-plugin) website integration like
 * this one.
 *
 * Everything below — the endpoint URL, request fields, response shape, and
 * webhook signature scheme — is a PLACEHOLDER modeled on common
 * merchant-id/api-key hosted-checkout conventions (including Grow's, since
 * that's the closest documented Israeli analog). None of it is confirmed
 * against uPay's actual integration contract.
 *
 * Before this can process a real payment:
 *   1. Sign up at upay.co.il (contact info@upay.co.il / WhatsApp
 *      055-9763169) and ask their support specifically for API/webhook
 *      integration docs for a custom website (not a WordPress/Shopify
 *      plugin) — this may not be self-serve.
 *   2. Get real credentials (merchant/terminal id, API key, webhook
 *      secret — exact names TBD) and set them as Cloudflare secrets:
 *      UPAY_MERCHANT_ID, UPAY_API_KEY, UPAY_WEBHOOK_SECRET (see
 *      .dev.vars.example).
 *   3. Replace `UPAY_API_BASE_URL_UNCONFIRMED` and the request/response
 *      shapes in `createHostedCheckoutSession` and `verifyWebhookSignature`
 *      with the real contract from uPay's docs/support.
 */
const UPAY_API_BASE_URL_UNCONFIRMED = "https://api.upay.co.il"; // UNCONFIRMED

export interface UpayCredentials {
  merchantId: string;
  apiKey: string;
  webhookSecret: string;
}

/** Reads uPay credentials from the Cloudflare env. Returns null if any are missing (not configured yet). */
export async function getUpayCredentials(): Promise<UpayCredentials | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const merchantId = env.UPAY_MERCHANT_ID;
    const apiKey = env.UPAY_API_KEY;
    const webhookSecret = env.UPAY_WEBHOOK_SECRET;
    if (!merchantId || !apiKey || !webhookSecret) return null;
    return { merchantId, apiKey, webhookSecret };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for uPay credentials:", error);
    return null;
  }
}

export interface CreateCheckoutSessionParams {
  /** Our own purchase row id — must round-trip through uPay so the webhook can correlate back to it. UNCONFIRMED whether uPay's hosted page supports an opaque reference/custom field for this. */
  purchaseId: string;
  amountIls: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  redirectUrl: string;
}

/**
 * Creates a hosted-checkout session and returns the URL to redirect the
 * buyer to. PLACEHOLDER implementation — see the file-level comment.
 * Throws if credentials aren't configured; callers should catch this and
 * degrade gracefully rather than surface a raw 500 to the buyer.
 */
export async function createHostedCheckoutSession(
  credentials: UpayCredentials,
  params: CreateCheckoutSessionParams,
): Promise<CheckoutSession> {
  const response = await fetch(
    `${UPAY_API_BASE_URL_UNCONFIRMED}/v1/checkout-sessions`, // UNCONFIRMED endpoint path
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      body: JSON.stringify({
        merchantId: credentials.merchantId, // UNCONFIRMED field name
        amount: params.amountIls, // UNCONFIRMED: currency unit (ILS vs agorot)
        description: params.description,
        reference: params.purchaseId, // UNCONFIRMED: whether/how a caller-supplied reference is echoed back on the webhook
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `uPay checkout session request failed with ${response.status}`,
    );
  }

  const data = (await response.json()) as { url?: string }; // UNCONFIRMED response shape
  if (!data.url) {
    throw new Error("uPay checkout session response missing a redirect URL");
  }
  return { redirectUrl: data.url };
}

export interface UpayWebhookEvent {
  /** Our purchase id, if the provider echoed it back. UNCONFIRMED field. */
  purchaseId: string | null;
  /** Provider-side transaction identifier, stored as `provider_payment_id`. */
  providerTransactionId: string;
  amountIls: number;
  status: "paid" | "failed";
}

/**
 * Verifies a webhook request came from uPay and parses it into our shape.
 * PLACEHOLDER — assumes an HMAC-SHA256 signature header (the most common
 * convention, and what Grow's newer PaymentLinks system + most modern
 * gateways use) over the raw body, keyed by `webhookSecret`. UNCONFIRMED
 * against uPay's actual scheme; get the real one from their support before
 * relying on this for anything beyond local/manual testing.
 */
export async function verifyAndParseUpayWebhook(
  credentials: UpayCredentials,
  rawBody: string,
  signatureHeader: string | null,
): Promise<UpayWebhookEvent | null> {
  if (!signatureHeader) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(credentials.webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureBytes = hexToBytes(
    signatureHeader.replace(/^sha256=/, ""),
  );
  if (!signatureBytes) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    // See the identical cast + comment in lib/server/course-videos.ts:
    // Uint8Array's ArrayBufferLike backing admits SharedArrayBuffer at the
    // type level, which Web Crypto's BufferSource typing rejects, even
    // though this is always a real, non-shared ArrayBuffer at runtime.
    signatureBytes as BufferSource,
    new TextEncoder().encode(rawBody),
  );
  if (!valid) return null;

  let payload: {
    reference?: string;
    transactionId?: string;
    amount?: number;
    status?: string;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (!payload.transactionId || typeof payload.amount !== "number") {
    return null;
  }

  return {
    purchaseId: payload.reference ?? null,
    providerTransactionId: payload.transactionId,
    amountIls: payload.amount,
    status: payload.status === "paid" ? "paid" : "failed",
  };
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
