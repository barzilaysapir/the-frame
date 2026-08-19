-- Grow (Meshulam) createPaymentProcess returns a processId + processToken
-- that must be stored server-side when a pending purchase is created, so
-- the webhook (POST /api/v1/webhooks/grow) can look the purchase back up
-- and verify the callback is genuine. Grow's server-to-server callback has
-- no signature/HMAC (confirmed against developers.grow.business) — this
-- pairing is the closest available authenticity check: a forged webhook
-- would need to guess both the purchase id (sent as cField1) and this
-- token, which is never exposed to the client.
ALTER TABLE purchases ADD COLUMN provider_process_id TEXT;
ALTER TABLE purchases ADD COLUMN provider_process_token TEXT;
