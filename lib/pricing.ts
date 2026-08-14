/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;
export type CheckoutPlanId = "rental" | "subscription";

/** One combination credit is worth the combination list price (ILS). */
export const COMBINATION_CREDIT_PRICE = 59;

/** Extra combination credits bundled with a course. */
export const COURSE_BUNDLE_EXTRA_CREDITS = 3;

/** Discount on the credits pack only, for buying several at once (not launch pricing). */
export const COURSE_CREDIT_BUNDLE_DISCOUNT = 0.2;

export function courseCreditsBundlePricing(coursePriceIls: number) {
  const creditsList = COURSE_BUNDLE_EXTRA_CREDITS * COMBINATION_CREDIT_PRICE;
  const creditsSale = Math.round(
    creditsList * (1 - COURSE_CREDIT_BUNDLE_DISCOUNT),
  );
  return {
    extraCredits: COURSE_BUNDLE_EXTRA_CREDITS,
    original: coursePriceIls + creditsList,
    sale: coursePriceIls + creditsSale,
  };
}

/** First integer in a display price like "₪200" or "₪99/mo". */
export function parsePriceIls(priceDisplay: string): number | null {
  const match = priceDisplay.match(/(\d+)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}
