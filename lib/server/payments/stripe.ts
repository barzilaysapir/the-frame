import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ApiError } from "@/lib/server/api/auth-context";
import type { AppDb } from "@/lib/server/db";
import type { Locale } from "@/lib/i18n/config";
import {
  getPurchaseById,
  markPurchasePaid,
  type Purchase,
} from "@/lib/server/users/repository";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_API_VERSION = "2026-07-29.dahlia";
const WEBHOOK_TOLERANCE_SECONDS = 300;

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string | null;
}

/** Returns null if Stripe isn't configured — callers treat it as an unavailable gateway. */
export async function getStripeConfig(): Promise<StripeConfig | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const secretKey = env.STRIPE_SECRET_KEY;
    if (!secretKey) return null;
    return {
      secretKey,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || null,
    };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for Stripe config:", error);
    return null;
  }
}

/** ILS is a two-decimal currency — Stripe `unit_amount` is agorot. */
export function ilsToMinorUnits(amountIls: number): number {
  return Math.round(amountIls * 100);
}

export interface CreateCheckoutSessionInput {
  amountIls: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  purchaseId: string;
  itemType: string;
  itemSlug: string;
  firebaseUid: string;
  customerEmail?: string | null;
  locale: Locale;
}

export interface StripeCheckoutSession {
  id: string;
  object?: string;
  url?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: StripeCheckoutSession };
}

/**
 * Flatten a nested object into Stripe's `application/x-www-form-urlencoded`
 * bracket notation (`line_items[0][price_data][currency]=ils`).
 */
export function flattenStripeParams(
  value: unknown,
  path = "",
  out: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  if (value === undefined || value === null) return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenStripeParams(item, path ? `${path}[${index}]` : String(index), out);
    });
    return out;
  }
  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      flattenStripeParams(nested, path ? `${path}[${key}]` : key, out);
    }
    return out;
  }
  if (!path) return out;
  out.append(path, String(value));
  return out;
}

export function buildCheckoutSessionParams(
  input: CreateCheckoutSessionInput,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.purchaseId,
    locale: input.locale,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "ils",
          unit_amount: ilsToMinorUnits(input.amountIls),
          product_data: { name: input.description },
        },
      },
    ],
    metadata: {
      purchaseId: input.purchaseId,
      itemType: input.itemType,
      itemSlug: input.itemSlug,
      firebaseUid: input.firebaseUid,
    },
  };
  if (input.customerEmail) {
    params.customer_email = input.customerEmail;
  }
  return params;
}

async function stripeRequest<T>(
  config: StripeConfig,
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.secretKey}`,
    "Stripe-Version": STRIPE_API_VERSION,
  };
  const init: RequestInit = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = flattenStripeParams(body).toString();
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, init);
  const json = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    console.error("[stripe] request failed", path, response.status, json.error?.message);
    throw new ApiError(502, "Payment provider request failed");
  }
  return json;
}

export async function createCheckoutSession(
  config: StripeConfig,
  input: CreateCheckoutSessionInput,
): Promise<StripeCheckoutSession> {
  const session = await stripeRequest<StripeCheckoutSession>(
    config,
    "POST",
    "/checkout/sessions",
    buildCheckoutSessionParams(input),
  );
  if (!session.id || !session.url) {
    throw new ApiError(502, "Stripe Checkout session was missing a redirect URL");
  }
  return session;
}

export async function retrieveCheckoutSession(
  config: StripeConfig,
  sessionId: string,
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(
    config,
    "GET",
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
  );
}

function hexFromBuffer(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

/**
 * Verifies Stripe-Signature the same way stripe-node's `constructEvent` does:
 * HMAC-SHA256 of `${timestamp}.${rawBody}` with the endpoint secret, compared
 * against any `v1` signature in the header. Rejects stale timestamps.
 */
export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<StripeEvent> {
  if (!signatureHeader) {
    throw new ApiError(400, "Missing Stripe-Signature header");
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of parts) {
    const [key, value] = part.split("=", 2);
    if (key === "t" && value) timestamp = Number(value);
    if (key === "v1" && value) signatures.push(value);
  }
  if (timestamp == null || !Number.isFinite(timestamp) || signatures.length === 0) {
    throw new ApiError(400, "Malformed Stripe-Signature header");
  }
  if (Math.abs(nowSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new ApiError(400, "Stripe webhook timestamp outside tolerance");
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );
  const expected = hexFromBuffer(mac);
  const matches = signatures.some((signature) => timingSafeEqual(signature, expected));
  if (!matches) {
    throw new ApiError(400, "Invalid Stripe webhook signature");
  }

  try {
    return JSON.parse(rawBody) as StripeEvent;
  } catch {
    throw new ApiError(400, "Stripe webhook body was not valid JSON");
  }
}

export function paymentIntentId(session: StripeCheckoutSession): string {
  const intent = session.payment_intent;
  if (typeof intent === "string" && intent) return intent;
  if (intent && typeof intent === "object" && typeof intent.id === "string") {
    return intent.id;
  }
  return session.id;
}

export function sessionPurchaseId(session: StripeCheckoutSession): string | null {
  return session.metadata?.purchaseId || session.client_reference_id || null;
}

/**
 * Returns a reason the session must not grant access, or null if it is safe
 * to mark the matching purchase paid. Amount is always checked against the
 * server-stored purchase, never a client-supplied value.
 */
export function sessionFulfillmentError(
  session: StripeCheckoutSession,
  purchase: Pick<Purchase, "amountIls" | "status" | "firebaseUid">,
  expectedUid?: string,
): string | null {
  if (session.payment_status !== "paid") {
    return `session ${session.id} is not paid (payment_status=${session.payment_status})`;
  }
  if (expectedUid && purchase.firebaseUid !== expectedUid) {
    return "session does not belong to the signed-in user";
  }
  if (session.metadata?.firebaseUid && session.metadata.firebaseUid !== purchase.firebaseUid) {
    return "session firebaseUid does not match the purchase owner";
  }
  if (purchase.amountIls == null) {
    return "purchase has no stored amount";
  }
  const expectedAmount = ilsToMinorUnits(purchase.amountIls);
  if (session.amount_total !== expectedAmount) {
    return `amount mismatch: stripe=${session.amount_total} expected=${expectedAmount}`;
  }
  if (session.currency && session.currency !== "ils") {
    return `currency mismatch: stripe=${session.currency}`;
  }
  return null;
}

export type FulfillmentStatus = "paid" | "pending" | "ignored";

/**
 * Marks a purchase paid from a verified Stripe Checkout Session.
 * Idempotent for already-paid rows. Callers must have already authenticated
 * the session (webhook HMAC, or a secret-key retrieve).
 */
export async function fulfillPaidCheckoutSession(
  db: AppDb,
  session: StripeCheckoutSession,
  expectedUid?: string,
): Promise<FulfillmentStatus> {
  if (session.payment_status !== "paid") return "pending";

  const purchaseId = sessionPurchaseId(session);
  if (!purchaseId) {
    console.error("[stripe] paid session missing purchaseId", session.id);
    return "ignored";
  }

  const purchase = await getPurchaseById(db, purchaseId);
  if (!purchase) {
    console.error(`[stripe] no purchase found for id ${purchaseId}`);
    return "ignored";
  }
  if (purchase.status === "paid") return "paid";
  if (purchase.status !== "pending") return "ignored";

  const error = sessionFulfillmentError(session, purchase, expectedUid);
  if (error) {
    console.error(`[stripe] refusing to fulfill ${session.id}: ${error}`);
    if (error === "session does not belong to the signed-in user") {
      throw new ApiError(403, "Checkout session does not belong to this account");
    }
    return "ignored";
  }

  await markPurchasePaid(db, purchase.id, paymentIntentId(session));
  return "paid";
}
