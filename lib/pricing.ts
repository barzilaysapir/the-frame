/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;
export type CheckoutPlanId = "rental" | "subscription";

/** 1 credit = ₪1 of wallet value. Future class/course prices are not locked. */
export const COMBINATION_CREDIT_PRICE = 1;

/** Extra credits bundled with a course (₪1 each before the pack discount). */
export const COURSE_BUNDLE_EXTRA_CREDITS = 100;

/** Discount on this credit pack only — not a promise about future catalog prices. */
export const COURSE_CREDIT_BUNDLE_DISCOUNT = 0.2;

export function courseCreditsBundlePricing(coursePriceIls: number) {
  const creditsList = COURSE_BUNDLE_EXTRA_CREDITS * COMBINATION_CREDIT_PRICE;
  const creditsSale = Math.round(
    creditsList * (1 - COURSE_CREDIT_BUNDLE_DISCOUNT),
  );
  return {
    extraCredits: COURSE_BUNDLE_EXTRA_CREDITS,
    creditPrice: COMBINATION_CREDIT_PRICE,
    creditsList,
    creditsSale,
    saved: creditsList - creditsSale,
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
