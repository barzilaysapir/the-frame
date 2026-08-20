export const UPAY_PAYMENT_METHODS = ["card", "bit"] as const;
export type UpayPaymentMethod = (typeof UPAY_PAYMENT_METHODS)[number];

/** Bit-for-business caps a single charge at ₪5,000 (Cardcom/uPay merchant docs). */
export const UPAY_BIT_MAX_ILS = 5000;

export function isUpayPaymentMethod(value: unknown): value is UpayPaymentMethod {
  return value === "card" || value === "bit";
}

export function bitAmountAllowed(amountIls: number): boolean {
  return amountIls <= UPAY_BIT_MAX_ILS;
}

export function upayProviderForMethod(method: UpayPaymentMethod): string {
  return method === "bit" ? "upay-bit" : "upay";
}
