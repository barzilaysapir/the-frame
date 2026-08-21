/**
 * uPay POS `json.php` replies with `errorN:code` (plain text) on failure.
 * A real Bit accept is anything else that is not empty.
 */
export function isUpayBitAccepted(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;
  if (/^error\d*:/i.test(trimmed)) return false;
  if (/wronginput/i.test(trimmed)) return false;
  return true;
}
