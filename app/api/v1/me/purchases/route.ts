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
import { buildUpayBrowserReturnUrl, buildUpayIpnUrl } from "@/lib/payments/pay-return";
import {
  buildUpayFormFields,
  getUpayConfig,
  upayProviderForMethod,
} from "@/lib/server/payments/upay";
import {
  createPendingPurchase,
  findPaidPurchase,
  findPendingPurchase,
  reopenUnverifiedUpayReturnPurchases,
  setPendingPurchaseAmount,
  setPendingPurchaseProvider,
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
  /** In-app path after card pay — rewritten to the production course URL. */
  returnPath?: unknown;
  /** Card only for now. Bit returns 400 until a later PSP (e.g. Grow). */
  paymentMethod?: unknown;
}

interface PurchaseResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present for card checkout — the client POSTs this form to uPay. */
  upayForm?: { action: string; fields: Record<string, string> };
}

/**
 * Creates/reuses a `pending` purchases row after recomputing the price
 * server-side, then returns a uPay card hosted-page form.
 *
 * Bit is not offered while on uPay’s public button API. Revisit with a
 * monthly-fee PSP (Grow, etc.) once the site has paying customers.
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
    if (body.paymentMethod === "bit") {
      throw new ApiError(400, "Bit is not available yet — pay with card");
    }
    const locale = resolveCatalogLocale(
      typeof body.locale === "string" ? body.locale : null,
    );

    // #320 marked pending rows paid from returnurl. Reopen those so Continue
    // can POST the card form again; IPN/admin paid rows stay paid.
    await reopenUnverifiedUpayReturnPurchases(
      db,
      claims.uid,
      itemType as CatalogItemType,
      itemSlug,
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

    const provider = upayProviderForMethod("card");
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
        provider,
      );
    } else {
      if (purchase.provider !== provider) {
        await setPendingPurchaseProvider(db, purchase.id, provider);
        purchase = { ...purchase, provider };
      }
      if (purchase.amountIls !== amountIls) {
        await setPendingPurchaseAmount(db, purchase.id, amountIls);
        purchase = { ...purchase, amountIls };
      }
    }

    const response: PurchaseResponse = {
      purchaseId: purchase.id,
      status: "pending",
      amountIls,
    };

    const upayConfig = await getUpayConfig();
    if (upayConfig) {
      const returnPath =
        typeof body.returnPath === "string" ? body.returnPath : "/he";
      response.upayForm = buildUpayFormFields(upayConfig, {
        amountIls,
        description,
        method: "card",
        returnUrl: buildUpayBrowserReturnUrl(returnPath),
        ipnUrl: buildUpayIpnUrl(purchase.id),
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
