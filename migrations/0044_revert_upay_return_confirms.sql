-- #320 marked pending purchases paid whenever the buyer hit uPay's
-- returnurl (`?payment=success`). That query is not proof of payment —
-- uPay always appends it — so Continue to payment then hit findPaidPurchase
-- and never built the hosted form. Put those rows back to pending so the
-- buyer can actually pay. IPN (`upay-ipn`) and admin (`manual`) rows stay paid.

UPDATE purchases
SET status = 'pending',
    provider_payment_id = NULL,
    paid_at = NULL
WHERE status = 'paid'
  AND provider_payment_id = 'upay-return';
