/**
 * #320 marked purchases paid from uPay's returnurl. That query is always
 * present, paid or not — those rows are not a real entitlement.
 */
export const UNVERIFIED_UPAY_RETURN_ID = "upay-return";

export function isVerifiedPaidEntitlement(
  providerPaymentId: string | null,
): boolean {
  return providerPaymentId !== UNVERIFIED_UPAY_RETURN_ID;
}
