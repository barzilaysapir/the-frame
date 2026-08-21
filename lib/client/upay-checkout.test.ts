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
  it("appends a hidden POST form and submits it", () => {
    const form = {
      method: "",
      action: "",
      style: { display: "" },
      children: [] as object[],
      submitted: false,
      appendChild(child: object) {
        this.children.push(child);
        return child;
      },
      submit() {
        this.submitted = true;
      },
    };
    const inputs: { type: string; name: string; value: string }[] = [];
    const body = {
      appended: null as unknown,
      appendChild(node: unknown) {
        this.appended = node;
        return node as Node;
      },
    };
    const doc = {
      createElement(tag: string) {
        if (tag === "form") return form;
        const input = { type: "", name: "", value: "" };
        inputs.push(input);
        return input;
      },
      body,
    };

    submitUpayForm(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
      { amount: "200.00", email: "merchant@example.com" },
      doc as unknown as Document,
    );

    expect(form.method).toBe("POST");
    expect(form.action).toBe(
      "https://app.upay.co.il/API6/clientsecure/redirectpage.php",
    );
    expect(form.style.display).toBe("none");
    expect(form.submitted).toBe(true);
    expect(body.appended).toBe(form);
    expect(inputs).toEqual([
      { type: "hidden", name: "amount", value: "200.00" },
      { type: "hidden", name: "email", value: "merchant@example.com" },
    ]);
  });
});
