import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
 * NOT CONFIRMED: the exact behavior of `returnurl` (does uPay redirect the
 * browser there after payment, with what query params?) and `ipnurl`
 * (POST or GET, what payload?) — both were blank in every generated
 * snippet seen so far. There is also NO documented signature/secret
 * returned with a callback to prove it's genuinely from uPay, unlike
 * Grow's processId/processToken pairing. The purchase id embedded in the
 * URLs below (an unguessable v4 UUID, never exposed except to the buyer's
 * own browser) is the only available correlation/security mechanism —
 * treat it as a capability URL, not a verified webhook signature.
 *
 * uPay has no sandbox at all (confirmed separately) — every real test of
 * `returnurl`/`ipnurl` behavior is a real charge. Verify with the smallest
 * possible amount, not repeated experiments.
 */

export interface UpayConfig {
  merchantEmail: string;
}

/** Returns null if uPay isn't configured — callers should treat it as just another unavailable option, same as Grow. */
export async function getUpayConfig(): Promise<UpayConfig | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const merchantEmail = env.UPAY_MERCHANT_EMAIL;
    if (!merchantEmail) return null;
    return { merchantEmail };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for uPay config:", error);
    return null;
  }
}

export interface UpayFormParams {
  amountIls: number;
  description: string;
  returnUrl: string;
  ipnUrl: string;
}

export interface UpayFormFields {
  action: string;
  fields: Record<string, string>;
}

const UPAY_ACTION_URL = "https://app.upay.co.il/API6/clientsecure/redirectpage.php";

/**
 * Builds the field set for the reverse-engineered dynamic payment form.
 * The client renders these as hidden inputs in a real `<form>` and submits
 * it — this can't be a plain redirect URL since uPay's endpoint is a POST.
 */
export function buildUpayFormFields(
  config: UpayConfig,
  params: UpayFormParams,
): UpayFormFields {
  return {
    action: UPAY_ACTION_URL,
    fields: {
      email: config.merchantEmail,
      amount: params.amountIls.toFixed(2),
      returnurl: params.returnUrl,
      ipnurl: params.ipnUrl,
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
    },
  };
}
