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
  if (data.upayForm) return { type: "redirect", form: data.upayForm };
  return { type: "unavailable" };
}

/**
 * uPay's checkout is a real POST (not a GET redirect). Build the form in JS
 * and submit immediately — a React ref + useEffect is easy to unmount before
 * submit() runs (e.g. if `owned` flips true on the same render).
 */
export function submitUpayForm(
  action: string,
  fields: Record<string, string>,
  doc: Document = document,
): void {
  const form = doc.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = doc.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  doc.body.appendChild(form);
  form.submit();
}
