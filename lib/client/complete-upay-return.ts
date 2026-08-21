import type { User } from "firebase/auth";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";

/**
 * After uPay's returnurl, mark the buyer's pending purchase paid (IPN
 * often never arrives) then read current ownership.
 */
export async function completeUpayReturn(
  user: User,
  itemType: string,
  itemSlug: string,
  purchaseId: string | null,
): Promise<boolean> {
  if (purchaseId) {
    await fetchWithAuth(user, "/api/v1/me/purchases/confirm", {
      method: "POST",
      body: JSON.stringify({ purchaseId }),
    });
  }
  const res = await fetchWithAuth(
    user,
    `/api/v1/me/purchases/status?itemType=${encodeURIComponent(itemType)}&itemSlug=${encodeURIComponent(itemSlug)}`,
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { status: "paid" | "none" };
  return data.status === "paid";
}
