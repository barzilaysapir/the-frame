/**
 * Site-wide monthly subscription (ILS).
 * Launch (early-bird) price must stay above a single combination’s list price.
 */
export const MONTHLY_SUBSCRIPTION = {
  original: 99,
  earlyBird: 59,
} as const;

/** @deprecated Prefer MONTHLY_SUBSCRIPTION.earlyBird */
export const MONTHLY_SUBSCRIPTION_ILS = MONTHLY_SUBSCRIPTION.earlyBird;

export type CheckoutPlanId = "rental" | "subscription";
