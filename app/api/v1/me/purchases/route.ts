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
  createPaymentPage,
  getTakbullConfig,
} from "@/lib/server/payments/takbull";
import {
  attachProviderProcess,
  createPendingPurchase,
  findPaidPurchase,
  findPendingPurchase,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURCHASABLE_ITEM_TYPES: CatalogItemType[] = ["lesson", "external_course"];
const PLAN_IDS: PurchasePlanId[] = ["rental", "course", "course-credits"];

interface PurchaseRequestBody {
  itemType?: unknown;
  itemSlug?: unknown;
  planId?: unknown;
  locale?: unknown;
  /** Path (not a full URL) the buyer should land back on after paying/cancelling — always resolved against our own SITE_URL server-side, so a client-supplied value can't redirect off-site. */
  returnPath?: unknown;
}

interface PurchaseResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present once Takbull is configured — the client must navigate the buyer to this hosted payment URL. */
  checkoutUrl?: string;
}

/**
 * Creates/reuses a `pending` purchases row after recomputing the price
 * server-side, then returns a Takbull hosted payment URL if configured.
 *
 * A client-supplied amount is never trusted — see
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
    const returnPath = typeof body.returnPath === "string" ? body.returnPath : null;

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
        amountIls: alreadyPaid.amountIls,
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
        "takbull",
      );
    }

    const response: PurchaseResponse = {
      purchaseId: purchase.id,
      status: "pending",
      amountIls: purchase.amountIls,
    };

    const path = returnPath && returnPath.startsWith("/") ? returnPath : "/";

    const takbullConfig = await getTakbullConfig();
    if (takbullConfig) {
      const page = await createPaymentPage(takbullConfig, {
        purchaseId: purchase.id,
        amountIls: purchase.amountIls ?? amountIls,
        description,
        successUrl: `${SITE_URL}${path}?payment=success&purchaseId=${purchase.id}`,
        cancelUrl: `${SITE_URL}${path}?payment=cancelled`,
        ipnUrl: `${SITE_URL}/api/v1/webhooks/takbull?purchaseId=${purchase.id}`,
        locale,
      });
      await attachProviderProcess(db, purchase.id, page.uniqId, "takbull");
      response.checkoutUrl = page.paymentPageUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
