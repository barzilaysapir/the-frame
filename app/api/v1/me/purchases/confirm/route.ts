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
 * Fallback when uPay's unsigned IPN never arrives: the signed-in buyer
 * who just landed on our returnurl with their own pending purchase id
 * can mark it paid. The UUID is a capability token (same as the IPN
 * query string); this additionally requires their Firebase session.
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
