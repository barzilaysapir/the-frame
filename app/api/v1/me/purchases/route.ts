import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  readJsonBody,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { enforceWriteRateLimit } from "@/lib/server/api/rate-limit";
import { resolveCatalogLocale } from "@/lib/server/catalog";
import type { CatalogItemType } from "@/lib/server/catalog/types";
import {
  resolvePurchasePrice,
  type PurchasePlanId,
} from "@/lib/server/payments/price-resolver";
import {
  createHostedCheckoutSession,
  getUpayCredentials,
} from "@/lib/server/payments/upay";
import {
  createPendingPurchase,
  findPaidPurchase,
  findPendingPurchase,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURCHASABLE_ITEM_TYPES: CatalogItemType[] = ["lesson", "external_course"];
const PLAN_IDS: PurchasePlanId[] = ["rental", "course", "course-credits"];

interface PurchaseRequestBody {
  itemType?: unknown;
  itemSlug?: unknown;
  planId?: unknown;
  locale?: unknown;
}

interface PurchaseResponse {
  purchaseId: string;
  status: "pending" | "paid";
  checkoutUrl: string | null;
  /** False when uPay credentials aren't configured yet (real signup pending) — the UI should show a "not available yet" state instead of a broken redirect. */
  providerConfigured: boolean;
}

/**
 * Starts (or resumes) a purchase for a single catalog item.
 *
 * The price is always recomputed here from the catalog + `lib/pricing.ts` —
 * a client-supplied amount is never trusted. See
 * `.cursor/rules/security-conventions.mdc`.
 */
export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();
    await upsertUserFromClaims(db, claims);

    const body = await readJsonBody<PurchaseRequestBody>(request);
    const itemType = body.itemType;
    const itemSlug = body.itemSlug;
    const planId = body.planId;
    if (
      typeof itemType !== "string" ||
      !PURCHASABLE_ITEM_TYPES.includes(itemType as CatalogItemType)
    ) {
      throw new ApiError(400, "itemType must be one of: " + PURCHASABLE_ITEM_TYPES.join(", "));
    }
    if (typeof itemSlug !== "string" || !itemSlug) {
      throw new ApiError(400, "itemSlug is required");
    }
    if (typeof planId !== "string" || !PLAN_IDS.includes(planId as PurchasePlanId)) {
      throw new ApiError(400, "planId must be one of: " + PLAN_IDS.join(", "));
    }
    const locale = resolveCatalogLocale(
      typeof body.locale === "string" ? body.locale : null,
    );

    const alreadyPaid = await findPaidPurchase(
      db,
      claims.uid,
      itemType as CatalogItemType,
      itemSlug,
    );
    if (alreadyPaid) {
      const response: PurchaseResponse = {
        purchaseId: alreadyPaid.id,
        status: "paid",
        checkoutUrl: null,
        providerConfigured: true,
      };
      return NextResponse.json(response);
    }

    const { amountIls, description } = await resolvePurchasePrice(
      locale,
      itemType as CatalogItemType,
      itemSlug,
      planId as PurchasePlanId,
    );

    let purchase = await findPendingPurchase(
      db,
      claims.uid,
      itemType as CatalogItemType,
      itemSlug,
    );
    if (!purchase) {
      purchase = await createPendingPurchase(
        db,
        claims.uid,
        itemType as CatalogItemType,
        itemSlug,
        amountIls,
        "upay",
      );
    }

    const credentials = await getUpayCredentials();
    if (!credentials) {
      // uPay signup/credentials aren't in place yet — still record the
      // pending purchase so the flow (and the admin page in a later PR)
      // has something real to work with, but tell the UI there's no
      // checkout link to redirect to.
      const response: PurchaseResponse = {
        purchaseId: purchase.id,
        status: "pending",
        checkoutUrl: null,
        providerConfigured: false,
      };
      return NextResponse.json(response);
    }

    const origin = new URL(request.url).origin;
    try {
      const session = await createHostedCheckoutSession(credentials, {
        purchaseId: purchase.id,
        amountIls,
        description,
        successUrl: `${origin}/${locale}/checkout/${itemSlug}?upay=success`,
        cancelUrl: `${origin}/${locale}/checkout/${itemSlug}?upay=cancel`,
      });
      const response: PurchaseResponse = {
        purchaseId: purchase.id,
        status: "pending",
        checkoutUrl: session.redirectUrl,
        providerConfigured: true,
      };
      return NextResponse.json(response);
    } catch (error) {
      // uPay's real request/response shape is unconfirmed (see
      // lib/server/payments/upay.ts) — treat any failure here as "not
      // wired up yet" rather than a 500, since it's expected until the
      // real contract is verified.
      console.error("[POST /api/v1/me/purchases] uPay checkout session failed:", error);
      const response: PurchaseResponse = {
        purchaseId: purchase.id,
        status: "pending",
        checkoutUrl: null,
        providerConfigured: false,
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    return jsonError(error);
  }
}
