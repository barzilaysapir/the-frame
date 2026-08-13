/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;
export type CheckoutPlanId = "rental" | "subscription";
