import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import type { CatalogItemType } from "@/lib/server/catalog/types";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHECKABLE_ITEM_TYPES: CatalogItemType[] = ["lesson", "external_course"];

/**
 * Lightweight read-only "do I own this" check — used to decide whether to
 * show a course's marketing/preview layout or its watch experience before
 * the buyer does anything (see CourseAccessGate). Deliberately separate
 * from POST /api/v1/me/purchases, which has side effects (creates a
 * pending purchase / calls out to Stripe) that a page-load status check
 * must not trigger.
 */
export async function GET(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();

    const itemType = request.nextUrl.searchParams.get("itemType");
    const itemSlug = request.nextUrl.searchParams.get("itemSlug");
    if (
      typeof itemType !== "string" ||
      !CHECKABLE_ITEM_TYPES.includes(itemType as CatalogItemType)
    ) {
      throw new ApiError(400, "itemType must be one of: " + CHECKABLE_ITEM_TYPES.join(", "));
    }
    if (!itemSlug) {
      throw new ApiError(400, "itemSlug is required");
    }

    const paid = await hasPaidPurchase(
      db,
      claims.uid,
      itemType as CatalogItemType,
      itemSlug,
    );
    return NextResponse.json({ status: paid ? "paid" : "none" });
  } catch (error) {
    return jsonError(error);
  }
}
