import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  readJsonBody,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { enforceWriteRateLimit } from "@/lib/server/api/rate-limit";
import {
  getPurchaseById,
  markPurchasePaid,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURCHASE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ConfirmBody {
  purchaseId?: unknown;
}

/**
 * Manual/self-serve fallback when uPay's unsigned IPN never arrives.
 * Do NOT call this from checkout just because returnurl has
 * `?payment=success` — uPay always appends that, paid or not. Doing so
 * marked pending rows paid and Continue to payment skipped the hosted
 * form (#321). Ownership on return is GET /api/v1/me/purchases/status
 * plus admin mark-paid. This endpoint stays for an explicit, future
 * confirmed-payment signal, not the return query string.
 */
export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();
    const body = await readJsonBody<ConfirmBody>(request);
    const purchaseId = body.purchaseId;
    if (typeof purchaseId !== "string" || !PURCHASE_ID.test(purchaseId)) {
      throw new ApiError(400, "purchaseId is required");
    }

    const purchase = await getPurchaseById(db, purchaseId);
    if (!purchase || purchase.firebaseUid !== claims.uid) {
      throw new ApiError(404, "Purchase not found");
    }
    if (purchase.status === "paid") {
      return NextResponse.json({
        purchaseId: purchase.id,
        status: "paid" as const,
      });
    }
    if (purchase.status !== "pending") {
      throw new ApiError(409, "Purchase cannot be confirmed");
    }
    await markPurchasePaid(db, purchase.id, "upay-return");

    return NextResponse.json({
      purchaseId: purchase.id,
      status: "paid" as const,
    });
  } catch (error) {
    return jsonError(error);
  }
}
