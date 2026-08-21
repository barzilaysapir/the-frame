import { describe, expect, it } from "vitest";
import {
  escapeHtmlAttr,
  renderUpayLaunchHtml,
} from "@/lib/payments/upay-launch-html";

describe("escapeHtmlAttr", () => {
  it("escapes quotes and tags in field values", () => {
    expect(escapeHtmlAttr(`a&b"c<d>`)).toBe("a&amp;b&quot;c&lt;d&gt;");
  });
});

describe("renderUpayLaunchHtml", () => {
  it("builds an auto-submit form to uPay", () => {
    const html = renderUpayLaunchHtml({
      action: "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
      fields: {
        amount: "1.00",
        returnurl: "https://the-frame.barzilaysapir.workers.dev/he?payment=success",
      },
    });
    expect(html).toContain('method="POST"');
    expect(html).toContain(
      'action="https://app.upay.co.il/API6/clientsecure/redirectpage.php"',
    );
    expect(html).toContain('name="amount" value="1.00"');
    expect(html).toContain("document.getElementById(\"upay\").submit()");
  });
});
