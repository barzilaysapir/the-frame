import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  readJsonBody,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { enforceWriteRateLimit } from "@/lib/server/api/rate-limit";
import { isAdminEmail } from "@/lib/server/admin";
import {
  listAllPurchases,
  markPurchasePaidManually,
  markPurchaseRefunded,
  type Purchase,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  const claims = await requireFirebaseClaims(request);
  if (!(await isAdminEmail(claims.email))) {
    throw new ApiError(403, "Not authorized");
  }
  return claims;
}

function serializePurchase(purchase: Purchase) {
  return {
    id: purchase.id,
    firebaseUid: purchase.firebaseUid,
    itemType: purchase.itemType,
    itemSlug: purchase.itemSlug,
    provider: purchase.provider,
    providerPaymentId: purchase.providerPaymentId,
    amountIls: purchase.amountIls,
    currency: purchase.currency,
    status: purchase.status,
    createdAt: purchase.createdAt,
    paidAt: purchase.paidAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const db = await requireAppDb();
    const purchases = await listAllPurchases(db);
    return NextResponse.json({ purchases: purchases.map(serializePurchase) });
  } catch (error) {
    return jsonError(error);
  }
}

interface PatchBody {
  purchaseId?: unknown;
  action?: unknown;
}

export async function PATCH(request: NextRequest) {
  try {
    const claims = await requireAdmin(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();

    const body = await readJsonBody<PatchBody>(request);
    if (typeof body.purchaseId !== "string" || !body.purchaseId) {
      throw new ApiError(400, "purchaseId is required");
    }
    if (body.action !== "mark_paid" && body.action !== "mark_refunded") {
      throw new ApiError(400, 'action must be "mark_paid" or "mark_refunded"');
    }

    if (body.action === "mark_paid") {
      await markPurchasePaidManually(db, body.purchaseId);
    } else {
      await markPurchaseRefunded(db, body.purchaseId);
    }

    const purchases = await listAllPurchases(db);
    return NextResponse.json({ purchases: purchases.map(serializePurchase) });
  } catch (error) {
    return jsonError(error);
  }
}
