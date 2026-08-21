import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isUpayBitAccepted } from "@/lib/payments/upay-bit-response";
import type { UpayPaymentMethod } from "@/lib/payments/upay-method";

export {
  bitAmountAllowed,
  isUpayPaymentMethod,
  UPAY_BIT_MAX_ILS,
  UPAY_PAYMENT_METHODS,
  upayProviderForMethod,
  type UpayPaymentMethod,
} from "@/lib/payments/upay-method";

/**
 * uPay (upay.co.il) has no publicly documented API — confirmed by a
 * hands-on dashboard audit (see the "אינטגרציית תשלומים" Notion doc).
 * This client is built against a mechanism reverse-engineered from the
 * HTML "embed code" uPay's dashboard generates for a manually-created
 * payment button (יצירת כפתור תשלום): a plain `<form method="post">` to
 * `API6/clientsecure/redirectpage.php` with these fields as hidden inputs.
 *
 * CONFIRMED (real ₪200 test transaction, 2026-08-18): `amount` is
 * genuinely live — the buyer was charged exactly the amount placed in the
 * form, not a fixed value tied to a pre-made button server-side. That
 * means a real per-order dynamic payment page is possible here, not just
 * a handful of pre-created static links.
 *
 * The live dashboard button (2026-08-21) posts `email=theframe@bybarzilay.com`.
 * Buyer לכבוד / email stay on uPay’s hosted page — stuffing them into this
 * POST bounced (`wronginputinvoicename` / `wronginputinvoiceemail`).
 *
 * Card: send `returnurl` (course path) and `ipnurl` so the buyer leaves
 * uPay’s success popup and IPN can mark the purchase paid. Do not treat
 * the browser return as paid.
 *
 * Bit: do not POST `redirectpage.php` (that is the card page). POS uses
 * `json.php` with `providername=bit` plus `cellphone` / `cellphonenotify`.
 *
 * uPay has no sandbox at all (confirmed separately) — every real test is
 * a real charge. Verify with the smallest possible amount.
 */

/** Public merchant id from the dashboard embed — not a password. */
export const UPAY_DASHBOARD_MERCHANT_EMAIL = "theframe@bybarzilay.com";

export interface UpayConfig {
  merchantEmail: string;
}

/** Always the dashboard button email so a stale Cloudflare secret cannot 404 the merchant. */
export async function getUpayConfig(): Promise<UpayConfig | null> {
  try {
    await getCloudflareContext({ async: true });
    return { merchantEmail: UPAY_DASHBOARD_MERCHANT_EMAIL };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for uPay config:", error);
    return { merchantEmail: UPAY_DASHBOARD_MERCHANT_EMAIL };
  }
}

export interface UpayFormParams {
  amountIls: number;
  description: string;
  method?: UpayPaymentMethod;
  /** Israeli mobile `05xxxxxxxx` — required for Bit (uPay sends the charge to this phone). */
  payerPhone?: string;
  /** Production course URL — omit to match the dashboard button’s blank return. */
  returnUrl?: string;
  /** Production IPN URL with our purchase id. */
  ipnUrl?: string;
}

export interface UpayFormFields {
  action: string;
  fields: Record<string, string>;
}

const UPAY_CARD_ACTION_URL =
  "https://app.upay.co.il/API6/clientsecure/redirectpage.php";
const UPAY_BIT_ACTION_URL =
  "https://app.upay.co.il/API6/clientsecure/json.php";

/** Dashboard buttons use `1`, not `1.00`. Whole shekels stay integers. */
export function formatUpayAmount(amountIls: number): string {
  return Number.isInteger(amountIls) ? String(amountIls) : amountIls.toFixed(2);
}

/**
 * Same hidden fields as the dashboard button, with a live amount,
 * paymentdetails, and optional callbacks. Do not POST buyer לכבוד / email.
 *
 * Bit posts to `json.php`, not the card hosted page.
 */
export function buildUpayFormFields(
  config: UpayConfig,
  params: UpayFormParams,
): UpayFormFields {
  const method = params.method ?? "card";
  const fields: Record<string, string> = {
    email: config.merchantEmail,
    amount: formatUpayAmount(params.amountIls),
    returnurl: params.returnUrl ?? "",
    ipnurl: params.ipnUrl ?? "",
    paymentdetails: params.description,
    maxpayments: "1",
    livesystem: "1",
    commissionreduction: "",
    createinvoiceandreceipt: "1",
    createinvoice: "0",
    createreceipt: "0",
    refername: "UPAY",
    lang: "HE",
    currency: "NIS",
  };
  if (method === "bit") {
    fields.providername = "bit";
    if (params.payerPhone) {
      fields.cellphone = params.payerPhone;
      fields.cellphonenotify = params.payerPhone;
    }
  }
  return {
    action: method === "bit" ? UPAY_BIT_ACTION_URL : UPAY_CARD_ACTION_URL,
    fields,
  };
}

/** Send a Bit charge request to the buyer’s phone. Does not open the card page. */
export async function requestUpayBitPayment(
  config: UpayConfig,
  params: UpayFormParams,
): Promise<void> {
  const form = buildUpayFormFields(config, { ...params, method: "bit" });
  const res = await fetch(form.action, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(form.fields),
  });
  const text = await res.text();
  if (!res.ok || !isUpayBitAccepted(text)) {
    console.error("[upay] Bit request rejected", {
      status: res.status,
      preview: text.slice(0, 40),
    });
    throw new Error("UPAY_BIT_REJECTED");
  }
}
