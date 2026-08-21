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

  it("leaves a blank returnurl blank", () => {
    const form = {
      action: "https://app.upay.co.il/x",
      fields: {
        amount: "1.00",
        returnurl: "",
        ipnurl: "",
      },
    };
    expect(checkoutAfterPurchase({ status: "pending", upayForm: form })).toEqual({
      type: "redirect",
      form,
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

  it("keeps Bit on-site instead of posting the card hosted page", () => {
    expect(checkoutAfterPurchase({ status: "pending", bitSent: true })).toEqual({
      type: "bit-sent",
    });
    expect(
      checkoutAfterPurchase({
        status: "pending",
        upayForm: {
          action: "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
          fields: { providername: "bit", amount: "200" },
        },
      }),
    ).toEqual({ type: "bit-sent" });
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
            acceptCharset: "",
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
