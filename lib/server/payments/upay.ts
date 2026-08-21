import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { upaySafeInvoiceName } from "@/lib/payments/upay-invoice-name";
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
 * The live dashboard button (2026-08-21) posts `email=theframe@bybarzilay.com`
 * and leaves `returnurl` / `ipnurl` blank. Filling those URLs made uPay
 * bounce with USER_NOT_EXISTS. Match the button: blank callbacks, that
 * email, dynamic amount + paymentdetails.
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
  /** Invoice “לכבוד” on the hosted page. */
  payerName?: string;
  /** Buyer email on the hosted page (not the merchant `email` field). */
  payerEmail?: string;
}

export interface UpayFormFields {
  action: string;
  fields: Record<string, string>;
}

const UPAY_ACTION_URL = "https://app.upay.co.il/API6/clientsecure/redirectpage.php";

/** Dashboard buttons use `1`, not `1.00`. Whole shekels stay integers. */
export function formatUpayAmount(amountIls: number): string {
  return Number.isInteger(amountIls) ? String(amountIls) : amountIls.toFixed(2);
}

/**
 * Same hidden fields as the dashboard button, with a live amount and
 * paymentdetails. Callbacks stay blank on purpose.
 *
 * Bit: `redirectpage.php` rejects `paymentmethod=bit`. POS uses
 * `providername=bit` plus `cellphone` / `cellphonenotify`.
 */
export function buildUpayFormFields(
  config: UpayConfig,
  params: UpayFormParams,
): UpayFormFields {
  const method = params.method ?? "card";
  const fields: Record<string, string> = {
    email: config.merchantEmail,
    amount: formatUpayAmount(params.amountIls),
    returnurl: "",
    ipnurl: "",
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
  // `wronginputinvoicename` on Hebrew (e.g. ספיר ברזילי). Latin only.
  const payerName = params.payerName
    ? upaySafeInvoiceName(params.payerName)
    : null;
  const payerEmail = params.payerEmail?.trim();
  if (payerName) {
    fields.invoicename = payerName;
    fields.fullname = payerName;
  }
  if (payerEmail) {
    fields.invoiceemail = payerEmail;
    fields.payeremail = payerEmail;
  }
  if (method === "bit") {
    fields.providername = "bit";
    if (params.payerPhone) {
      fields.cellphone = params.payerPhone;
      fields.cellphonenotify = params.payerPhone;
    }
  }
  return {
    action: UPAY_ACTION_URL,
    fields,
  };
}
