import { NextRequest, NextResponse } from "next/server";
import { ApiError, jsonError, requireAppDb } from "@/lib/server/api/auth-context";
import {
  fulfillPaidCheckoutSession,
  getStripeConfig,
  verifyStripeSignature,
} from "@/lib/server/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULFILLABLE_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

/**
 * Stripe's HMAC-signed webhook. Unlike the old uPay IPN (no signature, see
 * #275), a forged callback cannot mark a purchase paid without the endpoint
 * secret. Stripe retries on non-2xx, so handler errors return 500; unknown
 * events and already-paid rows still return 200.
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getStripeConfig();
    if (!config?.webhookSecret) {
      throw new ApiError(503, "Stripe webhook secret is not configured");
    }

    const rawBody = await request.text();
    const event = await verifyStripeSignature(
      rawBody,
      request.headers.get("stripe-signature"),
      config.webhookSecret,
    );

    if (!FULFILLABLE_EVENTS.has(event.type)) {
      return NextResponse.json({ ok: true, ignored: event.type });
    }

    const db = await requireAppDb();
    const status = await fulfillPaidCheckoutSession(db, event.data.object);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return jsonError(error);
  }
}
