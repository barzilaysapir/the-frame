/**
 * Phase 1 payment method: Bit only, manually confirmed by the site owner
 * (see app/[locale]/admin/purchases) — no payment-gateway integration yet.
 * Bit has no public deep-link/API for triggering a payment from a
 * non-merchant-integrated website (that only exists via a registered
 * payment aggregator — Hyp/uPay/Grow/etc., the automated-gateway path
 * deliberately deferred for Phase 1), so this is a manual "here's the
 * number, send it yourself" flow — see `components/checkout/BitPaymentCard.tsx`.
 *
 * The real number (same one used for the site's WhatsApp contact,
 * confirmed by the site owner) is +972523205206, shown here in the local
 * format Bit's own app expects when entering a recipient.
 */
export const BIT_PAYMENT_INFO =
  process.env.NEXT_PUBLIC_BIT_PAYMENT_INFO || "052-320-5206";
