/** Escape text for an HTML attribute value. */
export function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Auto-submitting uPay form as a full HTML document. Written into the
 * current browsing context so the submit runs from a parser-inserted
 * script (programmatic form.submit() after an async fetch does not
 * navigate on workers.dev).
 */
export function renderUpayLaunchHtml(form: {
  action: string;
  fields: Record<string, string>;
}): string {
  const inputs = Object.entries(form.fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtmlAttr(name)}" value="${escapeHtmlAttr(value)}">`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>uPay</title></head><body><form id="upay" method="POST" action="${escapeHtmlAttr(form.action)}">${inputs}</form><script>document.getElementById("upay").submit()</script></body></html>`;
}
