import { rewriteUpayFormFields } from "@/lib/payments/upay-callback-url";

/**
 * After POST /api/v1/me/purchases: owned, card hosted-form POST, Bit
 * already requested on the server, or no payment method is live.
 */
export function checkoutAfterPurchase(data: {
  status: "pending" | "paid";
  upayForm?: { action: string; fields: Record<string, string> };
  bitRequested?: boolean;
}):
  | { type: "owned" }
  | { type: "redirect"; form: { action: string; fields: Record<string, string> } }
  | { type: "bit-pending" }
  | { type: "unavailable" } {
  if (data.status === "paid") return { type: "owned" };
  if (data.bitRequested) return { type: "bit-pending" };
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
 * uPay's card checkout is a real POST (not a GET redirect). Build the
 * form in JS and submit immediately — same path as the 18 Aug working
 * card charge. Bit never uses this.
 */
export function submitUpayForm(
  action: string,
  fields: Record<string, string>,
  doc: Document = document,
): void {
  const form = doc.createElement("form");
  form.method = "POST";
  form.action = action;
  form.acceptCharset = "UTF-8";
  form.style.display = "none";
  const safeFields = rewriteUpayFormFields(fields);
  for (const [name, value] of Object.entries(safeFields)) {
    const input = doc.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  doc.body.appendChild(form);
  form.submit();
}
