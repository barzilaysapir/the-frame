import { NextRequest, NextResponse } from "next/server";
import {
  approveTransaction,
  getGrowConfig,
  type GrowWebhookPayload,
} from "@/lib/server/payments/grow";
import { requireAppDb } from "@/lib/server/api/auth-context";
import { getPurchaseById, markPurchasePaid } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-to-server transaction-status callback from Grow (Meshulam) — the
 * `notifyUrl` given to `createPaymentProcess`. See lib/server/payments/grow.ts.
 *
 * UNCONFIRMED WIRE FORMAT: Grow's docs describe the payload's logical
 * shape (a JSON example wrapped in `{status, err, data: {...}}`) but state
 * delivery is FormData, "the same way as you would send the data to the
 * CreatePaymentProcess method" — which uses flat top-level field names,
 * not a nested "data" object. Since the documented example also has a
 * naming collision between the outer numeric `status` (1/0) and the inner
 * human-readable `data.status` ("שולם"), the real wire format is probably
 * namespaced to avoid that — but this isn't shown anywhere. `readField`
 * below tries both a flat key and a few namespaced variants, and unknown
 * form keys are logged, so the first real sandbox delivery (trigger one
 * with Grow's documented `updateMyUrl` test tool) will show exactly which
 * shape arrived — adjust the key list here once confirmed, rather than
 * guessing further.
 *
 * No signature/HMAC is documented for this callback. Authenticity is
 * instead checked by comparing `processId`/`processToken` against what was
 * stored on the purchase when it was created (see migration 0038) — those
 * values are never exposed to the client, so a forged callback would need
 * to guess both.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const entries: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") entries[key] = value;
  }

  const readField = (name: string): string | undefined =>
    entries[name] ?? entries[`data[${name}]`] ?? entries[`data.${name}`];

  const purchaseId =
    readField("cField1") ??
    entries["customFields[cField1]"] ??
    entries["data[customFields][cField1]"];

  if (!purchaseId) {
    console.error(
      "[webhooks/grow] no purchase id (cField1) in callback; raw keys:",
      Object.keys(entries),
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const payload: GrowWebhookPayload = {
    asmachta: readField("asmachta") ?? "",
    cardSuffix: readField("cardSuffix"),
    cardType: readField("cardType"),
    cardTypeCode: readField("cardTypeCode"),
    cardBrand: readField("cardBrand"),
    cardBrandCode: readField("cardBrandCode"),
    cardExp: readField("cardExp"),
    firstPaymentSum: readField("firstPaymentSum") ?? "0",
    periodicalPaymentSum: readField("periodicalPaymentSum") ?? "0",
    status: readField("status") ?? "",
    statusCode: readField("statusCode") ?? "",
    transactionTypeId: readField("transactionTypeId") ?? "",
    paymentType: readField("paymentType") ?? "",
    sum: readField("sum") ?? "0",
    paymentsNum: readField("paymentsNum") ?? "0",
    allPaymentsNum: readField("allPaymentsNum") ?? "0",
    paymentDate: readField("paymentDate") ?? "",
    description: readField("description") ?? "",
    fullName: readField("fullName") ?? "",
    payerPhone: readField("payerPhone") ?? "",
    payerEmail: readField("payerEmail") ?? "",
    transactionId: readField("transactionId") ?? "",
    transactionToken: readField("transactionToken") ?? "",
    processId: readField("processId") ?? "",
    processToken: readField("processToken") ?? "",
    cField1: purchaseId,
  };

  try {
    const db = await requireAppDb();
    const purchase = await getPurchaseById(db, purchaseId);
    if (!purchase) {
      console.error(`[webhooks/grow] no purchase found for id ${purchaseId}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const tokenMatches =
      purchase.providerProcessId === payload.processId &&
      purchase.providerProcessToken === payload.processToken &&
      payload.processToken !== "";
    if (!tokenMatches) {
      console.error(
        `[webhooks/grow] processId/processToken mismatch for purchase ${purchaseId} — ignoring callback`,
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // statusCode "2" = paid, per Grow's documented example — only field
    // confirmed to mean success; anything else (declined, pending) is left
    // for the buyer to retry or the admin page to handle manually.
    if (payload.statusCode === "2" && purchase.status === "pending") {
      await markPurchasePaid(db, purchase.id, payload.asmachta || payload.transactionId);
    }

    const growConfig = await getGrowConfig();
    if (growConfig) {
      try {
        await approveTransaction(growConfig, payload);
      } catch (error) {
        // Best-effort per Grow's docs — the transaction is still processed
        // even if this call fails, so don't fail the webhook response.
        console.error("[webhooks/grow] approveTransaction failed:", error);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[webhooks/grow] handler error:", error);
    // Still 200 — Grow retries up to 5 times on non-200, which would only
    // repeat a failure that isn't going to resolve itself server-side.
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
