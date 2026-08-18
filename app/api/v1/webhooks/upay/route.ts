import { NextRequest, NextResponse } from "next/server";
import { requireAppDb } from "@/lib/server/api/auth-context";
import {
  getUpayCredentials,
  verifyAndParseUpayWebhook,
} from "@/lib/server/payments/upay";
import { getPurchaseById, markPurchasePaid } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-to-server payment confirmation callback from uPay.
 *
 * ⚠️ UNCONFIRMED — the header name below (`X-Upay-Signature`), the payload
 * shape, and even whether uPay calls back via a signed webhook at all (vs.
 * e.g. a plain server-to-server POST with no signature, like some of
 * Grow's legacy formats) are all placeholders — see the warning at the top
 * of `lib/server/payments/upay.ts`. Update this route once uPay's actual
 * webhook contract is confirmed from their support/docs.
 */
export async function POST(request: NextRequest) {
  const credentials = await getUpayCredentials();
  if (!credentials) {
    console.error("[POST /api/v1/webhooks/upay] uPay credentials not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-upay-signature"); // UNCONFIRMED header name

  const event = await verifyAndParseUpayWebhook(credentials, rawBody, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid webhook signature or payload" }, { status: 401 });
  }

  if (!event.purchaseId) {
    // Can't correlate this event to one of our purchases — likely means
    // uPay doesn't actually echo back a caller-supplied reference the way
    // this integration assumes. Log loudly so it surfaces during manual
    // testing rather than silently dropping real payment confirmations.
    console.error(
      "[POST /api/v1/webhooks/upay] webhook had no purchaseId reference — cannot correlate to a purchase:",
      event,
    );
    return NextResponse.json({ error: "Missing purchase reference" }, { status: 400 });
  }

  const db = await requireAppDb();
  const purchase = await getPurchaseById(db, event.purchaseId);
  if (!purchase) {
    console.error("[POST /api/v1/webhooks/upay] unknown purchaseId:", event.purchaseId);
    return NextResponse.json({ error: "Unknown purchase" }, { status: 404 });
  }

  if (event.status === "paid") {
    // Idempotent by construction (markPurchasePaid only updates rows still
    // `pending`) — a retried webhook delivery is safe.
    await markPurchasePaid(db, purchase.id, event.providerTransactionId);
  } else {
    console.error(
      "[POST /api/v1/webhooks/upay] payment failed for purchase:",
      purchase.id,
    );
  }

  return NextResponse.json({ ok: true });
}
