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
  fulfillPaidCheckoutSession,
  getStripeConfig,
  retrieveCheckoutSession,
} from "@/lib/server/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_ID_MAX_LENGTH = 200;

interface ConfirmBody {
  sessionId?: unknown;
}

/**
 * Completes a purchase after Stripe redirects the buyer back with
 * `session_id={CHECKOUT_SESSION_ID}`. Retrieves the session with the secret
 * key (so the client can't forge a paid status) and marks the row paid when
 * Stripe says it is. Complements the signed webhook so access unlocks even
 * if the webhook is delayed or not yet configured.
 */
export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();

    const body = await readJsonBody<ConfirmBody>(request);
    if (typeof body.sessionId !== "string" || !body.sessionId) {
      throw new ApiError(400, "sessionId is required");
    }
    if (
      body.sessionId.length > SESSION_ID_MAX_LENGTH ||
      !body.sessionId.startsWith("cs_")
    ) {
      throw new ApiError(400, "sessionId is not a Stripe Checkout Session id");
    }

    const stripeConfig = await getStripeConfig();
    if (!stripeConfig) {
      throw new ApiError(503, "Stripe is not configured");
    }

    const session = await retrieveCheckoutSession(stripeConfig, body.sessionId);
    const status = await fulfillPaidCheckoutSession(db, session, claims.uid);
    return NextResponse.json({ status });
  } catch (error) {
    return jsonError(error);
  }
}
