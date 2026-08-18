/**
 * Phase 1 payment method: Bit only, manually confirmed by the site owner
 * (see app/[locale]/admin/purchases) — no payment-gateway integration yet.
 *
 * BLOCKER: nobody has supplied a real Bit phone number/payment link for
 * this. `NEXT_PUBLIC_BIT_PAYMENT_INFO` must be set (as a real Cloudflare
 * Workers Build variable, same as the Firebase NEXT_PUBLIC_* vars) before
 * this can go live — until then the checkout UI shows the placeholder
 * below verbatim, which is intentionally obviously fake rather than a
 * real-looking invented number.
 */
export const BIT_PAYMENT_INFO =
  process.env.NEXT_PUBLIC_BIT_PAYMENT_INFO ||
  "050-000-0000 (placeholder — set NEXT_PUBLIC_BIT_PAYMENT_INFO)";
