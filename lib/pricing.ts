/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;
export type CheckoutPlanId = "rental" | "subscription";

/** List vs launch price of one combination credit (same as a combo’s ILS prices). */
export const COMBINATION_CREDIT = {
  original: 59,
  launch: 39,
} as const;

/** Extra combination credits bundled with a course at launch credit price. */
export const COURSE_BUNDLE_EXTRA_CREDITS = 3;

export function courseCreditsBundlePricing(coursePriceIls: number) {
  return {
    extraCredits: COURSE_BUNDLE_EXTRA_CREDITS,
    original:
      coursePriceIls + COURSE_BUNDLE_EXTRA_CREDITS * COMBINATION_CREDIT.original,
    sale: coursePriceIls + COURSE_BUNDLE_EXTRA_CREDITS * COMBINATION_CREDIT.launch,
  };
}

/** First integer in a display price like "₪200" or "₪99/mo". */
export function parsePriceIls(priceDisplay: string): number | null {
  const match = priceDisplay.match(/(\d+)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}
