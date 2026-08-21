import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { rewriteUpayCallbackUrl } from "@/lib/payments/upay-callback-url";
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
 * Card: POST `redirectpage.php` with `returnurl` (production course path,
 * no `?payment=success`) and `ipnurl` so the buyer comes back here and
 * IPN can mark paid. Do not treat the browser return as paid.
 *
 * Bit: do not POST the hosted card page. uPay's POS posts
 * `providername=bit` plus `cellphone` / `cellphonenotify` to
 * `/API6/clientsecure/json.php`. We do that from the server and keep the
 * buyer on our waiting UI.
 *
 * uPay has no sandbox at all (confirmed separately) — every real test is
 * a real charge. Verify with the smallest possible amount.
 */

/** Public merchant id from the dashboard embed — not a password. */
export const UPAY_DASHBOARD_MERCHANT_EMAIL = "theframe@bybarzilay.com";

export const UPAY_ACTION_URL =
  "https://app.upay.co.il/API6/clientsecure/redirectpage.php";
export const UPAY_JSON_URL =
  "https://app.upay.co.il/API6/clientsecure/json.php";

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
  returnUrl: string;
  ipnUrl: string;
  method?: UpayPaymentMethod;
  /** Israeli mobile `05xxxxxxxx` — required for Bit (uPay sends the charge to this phone). */
  payerPhone?: string;
}

export interface UpayFormFields {
  action: string;
  fields: Record<string, string>;
}

/**
 * Same hidden fields as the dashboard button, with a live amount,
 * paymentdetails, and production callbacks.
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
    amount: params.amountIls.toFixed(2),
    returnurl: rewriteUpayCallbackUrl(params.returnUrl),
    ipnurl: rewriteUpayCallbackUrl(params.ipnUrl),
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
    action: UPAY_ACTION_URL,
    fields,
  };
}

/** True when uPay's json.php response is a rejection we should not treat as "sent". */
export function upayBitRequestFailed(
  responseText: string,
  status: number,
): string | null {
  if (status < 200 || status >= 300) {
    return `uPay Bit request failed (${status})`;
  }
  const trimmed = responseText.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("wronginput") ||
    lower.includes("user_not_exists") ||
    lower.includes("errormessage")
  ) {
    return trimmed.slice(0, 200) || "uPay rejected the Bit request";
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed) as {
        success?: unknown;
        error?: unknown;
        Error?: unknown;
        errormessage?: unknown;
      };
      if (json.success === false || json.error || json.Error || json.errormessage) {
        const message = json.error ?? json.Error ?? json.errormessage;
        return typeof message === "string" && message
          ? message
          : "uPay rejected the Bit request";
      }
    } catch {
      /* not JSON — a 2xx body is still a send attempt */
    }
  }
  return null;
}

/**
 * Ask uPay to send a Bit charge to the buyer's phone. Does not open the
 * hosted card page — the buyer stays on our waiting UI until IPN/admin
 * marks the purchase paid.
 */
export async function requestUpayBitCharge(
  config: UpayConfig,
  params: UpayFormParams,
): Promise<void> {
  if (!params.payerPhone) {
    throw new Error("Bit requires an Israeli mobile number");
  }
  const { fields } = buildUpayFormFields(config, {
    ...params,
    method: "bit",
  });
  const res = await fetch(UPAY_JSON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json, text/plain, */*",
    },
    body: new URLSearchParams(fields),
  });
  const text = await res.text();
  const failure = upayBitRequestFailed(text, res.status);
  if (failure) {
    console.error("[upay] Bit json.php failed", {
      status: res.status,
      body: text.slice(0, 500),
    });
    throw new Error(failure);
  }
}
