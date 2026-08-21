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
import { toIsraeliMobileNational } from "@/lib/phone";
import {
  bitAmountAllowed,
  buildUpayFormFields,
  getUpayConfig,
  isUpayPaymentMethod,
  UPAY_BIT_MAX_ILS,
  upayProviderForMethod,
  type UpayPaymentMethod,
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
  /** Ignored — the dashboard button leaves uPay returnurl blank. */
  returnPath?: unknown;
  /** `card` (default) or `bit`. Bit requires `phone`. */
  paymentMethod?: unknown;
  /** Israeli mobile for Bit — server-normalized; never used as a price. */
  phone?: unknown;
}

interface PurchaseResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present once uPay is configured (see lib/server/payments/upay.ts) — the client must render these as hidden inputs in a real `<form method="post">` and submit it (uPay's endpoint isn't a simple GET redirect). */
  upayForm?: { action: string; fields: Record<string, string> };
}

/**
 * Creates/reuses a `pending` purchases row after recomputing the price
 * server-side, then returns a uPay form. Card is the hosted page. Bit
 * adds providername=bit plus the buyer’s mobile so uPay can send a
 * payment request to that phone. Grow was dropped (monthly fee).
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
    const paymentMethod: UpayPaymentMethod = isUpayPaymentMethod(body.paymentMethod)
      ? body.paymentMethod
      : "card";
    const payerPhone =
      paymentMethod === "bit" && typeof body.phone === "string"
        ? toIsraeliMobileNational(body.phone)
        : null;
    if (paymentMethod === "bit" && !payerPhone) {
      throw new ApiError(400, "phone must be a valid Israeli mobile number");
    }

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

    if (paymentMethod === "bit" && !bitAmountAllowed(amountIls)) {
      throw new ApiError(
        400,
        `Bit payments are limited to ₪${UPAY_BIT_MAX_ILS}`,
      );
    }

    const provider = upayProviderForMethod(paymentMethod);
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
      response.upayForm = buildUpayFormFields(upayConfig, {
        amountIls,
        description,
        method: paymentMethod,
        payerPhone: payerPhone ?? undefined,
        payerName: claims.name ?? undefined,
        payerEmail: claims.email ?? undefined,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
