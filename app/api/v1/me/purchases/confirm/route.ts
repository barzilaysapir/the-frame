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
  fulfillByUniqId,
  getTakbullConfig,
} from "@/lib/server/payments/takbull";
import { getPurchaseById } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmBody {
  purchaseId?: unknown;
}

/**
 * Completes a purchase after Takbull redirects the buyer back. Looks up the
 * stored `uniqId` and calls `ValidateNotification` with the API secret so a
 * forged `?payment=success` URL cannot grant access.
 */
export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();

    const body = await readJsonBody<ConfirmBody>(request);
    if (typeof body.purchaseId !== "string" || !body.purchaseId) {
      throw new ApiError(400, "purchaseId is required");
    }

    const purchase = await getPurchaseById(db, body.purchaseId);
    if (!purchase || purchase.firebaseUid !== claims.uid) {
      throw new ApiError(404, "Purchase not found");
    }
    if (purchase.status === "paid") {
      return NextResponse.json({ status: "paid" });
    }
    if (!purchase.providerProcessId) {
      throw new ApiError(409, "Purchase has no Takbull session yet");
    }

    const config = await getTakbullConfig();
    if (!config) {
      throw new ApiError(503, "Takbull is not configured");
    }

    const status = await fulfillByUniqId(
      db,
      config,
      purchase,
      purchase.providerProcessId,
      claims.uid,
    );
    return NextResponse.json({ status });
  } catch (error) {
    return jsonError(error);
  }
}
