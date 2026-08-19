import { NextRequest, NextResponse } from "next/server";
import { requireAppDb } from "@/lib/server/api/auth-context";
import { getPurchaseById, markPurchasePaid } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * uPay's IPN callback for the reverse-engineered dynamic payment form (see
 * lib/server/payments/upay.ts). The `ipnurl` we send uPay is
 * `/api/v1/webhooks/upay?purchaseId=<our purchase id>`.
 *
 * SECURITY CAVEAT (real, not hypothetical): uPay documents no signature or
 * secret for this callback anywhere — this endpoint was reverse-engineered
 * from a dashboard-generated HTML snippet, not a published integration
 * guide. The only thing standing between "genuine uPay payment
 * confirmation" and "anyone who guesses this URL" is the purchase id being
 * an unguessable v4 UUID never exposed except to the buyer's own browser
 * session. That's a real but weaker safeguard than Grow's
 * processId/processToken pairing (two separate opaque values) — treat
 * this as a capability URL, not a verified webhook. Marking a purchase
 * paid here is a reasonable default given what's available, not a claim
 * that it's unforgeable.
 *
 * The exact payload shape (GET query params vs POST body, field names,
 * any per-transaction reference) is UNCONFIRMED — no real uPay callback
 * has been observed yet with a non-blank ipnurl. Everything received is
 * logged in full so the first real one (from an actual small test
 * payment) can be inspected and this handler tightened if uPay does send
 * something crosscheckable.
 */
export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const purchaseId = request.nextUrl.searchParams.get("purchaseId");

  let bodyForLog: unknown = null;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      bodyForLog = await request.json();
    } else if (
      contentType.includes("form") ||
      request.method === "POST"
    ) {
      const form = await request.formData();
      bodyForLog = Object.fromEntries(form.entries());
    }
  } catch {
    // Body may be empty (a GET callback) — not an error.
  }

  console.log("[webhooks/upay] callback received", {
    purchaseId,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    body: bodyForLog,
  });

  if (!purchaseId) {
    console.error("[webhooks/upay] no purchaseId in callback URL");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const db = await requireAppDb();
    const purchase = await getPurchaseById(db, purchaseId);
    if (!purchase) {
      console.error(`[webhooks/upay] no purchase found for id ${purchaseId}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    if (purchase.status === "pending") {
      await markPurchasePaid(db, purchase.id, "upay-ipn");
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[webhooks/upay] handler error:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
