/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;
export type CheckoutPlanId = "rental" | "subscription";

/** First integer in a display price like "₪200" or "₪99/mo". */
export function parsePriceIls(priceDisplay: string): number | null {
  const match = priceDisplay.match(/(\d+)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}
