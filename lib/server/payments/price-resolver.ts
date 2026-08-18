import "server-only";
import { ApiError } from "@/lib/server/api/auth-context";
import { getCachedExternalCourse, getCachedRoutine } from "@/lib/server/catalog";
import type { CatalogItemType } from "@/lib/server/catalog/types";
import type { Locale } from "@/lib/i18n/config";
import { courseCreditsBundlePricing, parsePriceIls } from "@/lib/pricing";

/**
 * Plan ids the checkout UI can send. Mirrors `CheckoutPlanPicker`'s options
 * in `CheckoutPlans`/`CourseCheckout` — kept as a plain union (not imported
 * from the client components) since this is the server-side source of
 * truth for what a plan id is allowed to mean and cost.
 *
 * `subscription` (site-wide monthly access) is intentionally excluded: the
 * `purchases` table only records a single `(item_type, item_slug)`
 * entitlement per row, so there's no schema-level way to grant "every
 * routine" yet. Wiring a real subscription purchase needs its own
 * entitlement model — out of scope here, tracked as a follow-up rather than
 * guessed at.
 */
export type PurchasePlanId = "rental" | "course" | "course-credits";

export interface ResolvedPrice {
  amountIls: number;
  description: string;
}

/**
 * Recomputes the price for `(itemType, itemSlug, planId)` from the catalog
 * + `lib/pricing.ts`, exactly mirroring what the checkout UI displays —
 * never trust a client-supplied amount (see
 * `.cursor/rules/security-conventions.mdc`).
 */
export async function resolvePurchasePrice(
  locale: Locale,
  itemType: CatalogItemType,
  itemSlug: string,
  planId: PurchasePlanId,
): Promise<ResolvedPrice> {
  if (itemType === "lesson") {
    if (planId !== "rental") {
      throw new ApiError(400, `Plan "${planId}" is not available for routines yet`);
    }
    const routine = await getCachedRoutine(locale, itemSlug);
    if (!routine) throw new ApiError(404, "Routine not found");
    return {
      amountIls: routine.pricing.earlyBird,
      description: `${routine.title} — 30-day access`,
    };
  }

  if (itemType === "external_course") {
    const course = await getCachedExternalCourse(locale, itemSlug);
    if (!course) throw new ApiError(404, "External course not found");
    const basePrice = parsePriceIls(course.priceDisplay);
    if (basePrice == null) {
      throw new ApiError(500, "Course has no parsable price");
    }
    if (planId === "course") {
      return { amountIls: basePrice, description: course.title };
    }
    if (planId === "course-credits") {
      const bundle = courseCreditsBundlePricing(basePrice);
      return {
        amountIls: bundle.sale,
        description: `${course.title} + ${bundle.extraCredits} credits`,
      };
    }
    throw new ApiError(400, `Plan "${planId}" is not available for courses`);
  }

  throw new ApiError(400, `Purchasing item type "${itemType}" is not supported yet`);
}
