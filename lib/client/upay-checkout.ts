import { rewriteUpayFormFields } from "@/lib/payments/upay-callback-url";
import { renderUpayLaunchHtml } from "@/lib/payments/upay-launch-html";

/**
 * After POST /api/v1/me/purchases: either the buyer already owns the item,
 * we have a uPay hosted-form payload to POST, or no payment method is live.
 */
export function checkoutAfterPurchase(data: {
  status: "pending" | "paid";
  upayForm?: { action: string; fields: Record<string, string> };
}):
  | { type: "owned" }
  | { type: "redirect"; form: { action: string; fields: Record<string, string> } }
  | { type: "unavailable" } {
  if (data.status === "paid") return { type: "owned" };
  if (data.upayForm) {
    return {
      type: "redirect",
      form: {
        action: data.upayForm.action,
        fields: rewriteUpayFormFields(data.upayForm.fields),
      },
    };
  }
  return { type: "unavailable" };
}

/**
 * Replace the current document with an auto-submit uPay form.
 * Programmatic form.submit() after an async fetch does not navigate
 * away from the Cloudflare Worker host.
 */
export function launchUpayCheckout(
  form: { action: string; fields: Record<string, string> },
  doc: Document = document,
): void {
  const html = renderUpayLaunchHtml({
    action: form.action,
    fields: rewriteUpayFormFields(form.fields),
  });
  doc.open();
  doc.write(html);
  doc.close();
}
