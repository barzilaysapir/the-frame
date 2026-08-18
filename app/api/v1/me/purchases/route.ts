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
import { createPaymentProcess, getGrowConfig } from "@/lib/server/payments/grow";
import {
  resolvePurchasePrice,
  type PurchasePlanId,
} from "@/lib/server/payments/price-resolver";
import { getUpayLinkForAmount } from "@/lib/server/payments/upay-links";
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

/** A valid Israeli mobile number — required by Grow's `pageField[phone]` (see lib/server/payments/grow.ts). Accepts spaces/dashes for pasted numbers. */
const IL_MOBILE_RE = /^05\d{8}$/;

interface PurchaseRequestBody {
  itemType?: unknown;
  itemSlug?: unknown;
  planId?: unknown;
  locale?: unknown;
  /** Israeli mobile number, required only once Grow is configured — see below. */
  phone?: unknown;
  /** Path (not a full URL) the buyer should land back on after paying/cancelling — always resolved against our own SITE_URL server-side, so a client-supplied value can't redirect off-site. */
  returnPath?: unknown;
}

interface PurchaseResponse {
  purchaseId: string;
  status: "pending" | "paid";
  amountIls: number | null;
  /** Present once Grow is configured and the hosted payment process was created — the client should offer this as a "pay now" option (Grow auto-confirms via webhook). */
  redirectUrl?: string;
  /** A static uPay payment link matching this exact amount, if one exists (see lib/server/payments/upay-links.ts) — offered as another option alongside Grow and the manual Bit instructions. Can be present at the same time as `redirectUrl`; the buyer picks whichever they prefer. */
  upayLinkUrl?: string;
}

/**
 * Creates/reuses a `pending` purchases row after recomputing the price
 * server-side, then returns every payment option currently available for
 * it — a Grow (Meshulam) hosted-checkout redirect (auto-confirms via
 * webhook) if Grow is configured, and/or a static uPay payment link if one
 * exists for this exact amount — alongside the always-available manual Bit
 * flow (see app/[locale]/admin/purchases). These are parallel choices for
 * the buyer, not a fallback chain: uPay is offered even when Grow is too.
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
    const phone = typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "") : null;
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
        "bit",
      );
    }

    const response: PurchaseResponse = {
      purchaseId: purchase.id,
      status: "pending",
      amountIls: purchase.amountIls,
    };

    const growConfig = await getGrowConfig();
    if (growConfig) {
      if (!phone || !IL_MOBILE_RE.test(phone)) {
        throw new ApiError(400, "A valid Israeli mobile number is required");
      }
      const path = returnPath && returnPath.startsWith("/") ? returnPath : "/";
      const result = await createPaymentProcess(growConfig, {
        sum: amountIls,
        description,
        fullName: claims.name || "Frame customer",
        phone,
        successUrl: `${SITE_URL}${path}?payment=success`,
        cancelUrl: `${SITE_URL}${path}?payment=cancelled`,
        notifyUrl: `${SITE_URL}/api/v1/webhooks/grow`,
        purchaseId: purchase.id,
      });
      await attachProviderProcess(db, purchase.id, result.processId, result.processToken);
      response.redirectUrl = result.url;
    }

    const upayLink = await getUpayLinkForAmount(purchase.amountIls ?? amountIls);
    if (upayLink) {
      response.upayLinkUrl = upayLink;
    }

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
