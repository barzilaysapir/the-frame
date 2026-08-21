import { describe, expect, it } from "vitest";
import { checkoutAfterPurchase, submitUpayForm } from "@/lib/client/upay-checkout";

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

describe("submitUpayForm", () => {
  it("POSTs a hidden form to uPay", () => {
    const appended: { method: string; action: string; names: string[] }[] = [];
    const doc = {
      createElement(tag: string) {
        if (tag === "form") {
          return {
            method: "",
            action: "",
            style: { display: "" },
            children: [] as { name: string; value: string }[],
            appendChild(child: { name: string; value: string }) {
              this.children.push(child);
            },
            submit() {},
          };
        }
        return { type: "", name: "", value: "" };
      },
      body: {
        appendChild(form: {
          method: string;
          action: string;
          children: { name: string }[];
        }) {
          appended.push({
            method: form.method,
            action: form.action,
            names: form.children.map((c) => c.name),
          });
        },
      },
    };

    submitUpayForm(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
      { amount: "1.00" },
      doc as unknown as Document,
    );

    expect(appended).toEqual([
      {
        method: "POST",
        action: "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
        names: ["amount"],
      },
    ]);
  });
});
