import { describe, expect, it } from "vitest";
import { checkoutAfterPurchase, launchUpayCheckout } from "@/lib/client/upay-checkout";

describe("checkoutAfterPurchase", () => {
  it("does not send an already-paid buyer to uPay, even if a form is present", () => {
    expect(
      checkoutAfterPurchase({
        status: "paid",
        upayForm: { action: "https://app.upay.co.il/x", fields: { amount: "1.00" } },
      }),
    ).toEqual({ type: "owned" });
  });

  it("rewrites a localhost returnurl before sending the buyer to uPay", () => {
    const form = {
      action: "https://app.upay.co.il/x",
      fields: {
        amount: "1.00",
        returnurl:
          "http://localhost:4127/he/external-courses/vibe-on-heels",
      },
    };
    expect(checkoutAfterPurchase({ status: "pending", upayForm: form })).toEqual({
      type: "redirect",
      form: {
        action: form.action,
        fields: {
          amount: "1.00",
          returnurl:
            "https://the-frame.barzilaysapir.workers.dev/he/external-courses/vibe-on-heels",
        },
      },
    });
  });

  it("redirects a pending purchase that has a uPay form", () => {
    const form = { action: "https://app.upay.co.il/x", fields: { amount: "200.00" } };
    expect(checkoutAfterPurchase({ status: "pending", upayForm: form })).toEqual({
      type: "redirect",
      form,
    });
  });

  it("surfaces a pending purchase with no payment method", () => {
    expect(checkoutAfterPurchase({ status: "pending" })).toEqual({
      type: "unavailable",
    });
  });
});

describe("launchUpayCheckout", () => {
  it("replaces the document with an auto-submit uPay form", () => {
    const written: string[] = [];
    const doc = {
      open() {},
      write(html: string) {
        written.push(html);
      },
      close() {},
    };

    launchUpayCheckout(
      {
        action: "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
        fields: { amount: "1.00" },
      },
      doc as unknown as Document,
    );

    expect(written).toHaveLength(1);
    expect(written[0]).toContain(
      'action="https://app.upay.co.il/API6/clientsecure/redirectpage.php"',
    );
    expect(written[0]).toContain('name="amount" value="1.00"');
    expect(written[0]).toContain("document.getElementById(\"upay\").submit()");
  });
});
