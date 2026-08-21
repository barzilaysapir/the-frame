/**
 * uPay’s hosted form rejects Hebrew (and likely any non-Latin) in
 * `invoicename` with `wronginputinvoicename ספיר ברזילי`. Latin names
 * still prefill; Hebrew buyers type לכבוד on the hosted page.
 */
const UPAY_INVOICE_NAME = /^[A-Za-z][A-Za-z0-9 .'\-]*$/;

export function upaySafeInvoiceName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > 80) return null;
  return UPAY_INVOICE_NAME.test(trimmed) ? trimmed : null;
}
