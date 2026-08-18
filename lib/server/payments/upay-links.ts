import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * uPay (upay.co.il) has no API for creating a hosted payment page
 * dynamically per order — confirmed by a hands-on dashboard audit (see
 * the "אינטגרציית תשלומים — uPay ואלטרנטיבות" Notion doc): the only
 * free option is manually creating a static payment link/button per
 * fixed amount in their dashboard ("יצירת כפתור תשלום"). Since those
 * links carry no order reference, this can only ever offer the buyer a
 * nicer (card-capable) payment page — it cannot auto-confirm a purchase
 * the way the Grow integration does. Admin confirmation on
 * app/[locale]/admin/purchases stays the only way a uPay-link payment
 * gets marked paid.
 *
 * `UPAY_PAYMENT_LINKS` is a single JSON-object secret mapping a whole-ILS
 * amount to the static link URL created for it in the uPay dashboard, e.g.
 * `{"29":"https://pay.upay.co.il/...","200":"https://pay.upay.co.il/..."}`.
 * A price with no matching key just isn't offered — the checkout UI falls
 * back to the Bit-only manual flow for that item.
 */
export async function getUpayLinkForAmount(amountIls: number): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const raw = env.UPAY_PAYMENT_LINKS;
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    const url = map[String(amountIls)];
    return typeof url === "string" && url ? url : null;
  } catch (error) {
    console.error("Failed to resolve UPAY_PAYMENT_LINKS:", error);
    return null;
  }
}
