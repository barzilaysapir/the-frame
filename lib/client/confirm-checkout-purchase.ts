import type { User } from "firebase/auth";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";

/**
 * Asks the server to validate a Takbull payment after the buyer returns
 * with `purchaseId`. The server re-checks Takbull; the query param alone
 * cannot mark a purchase paid.
 */
export async function confirmCheckoutPurchase(
  user: User,
  purchaseId: string,
): Promise<"paid" | "pending" | "ignored" | "error"> {
  try {
    const res = await fetchWithAuth(user, "/api/v1/me/purchases/confirm", {
      method: "POST",
      body: JSON.stringify({ purchaseId }),
    });
    if (!res.ok) return "error";
    const data = (await res.json()) as { status?: string };
    if (data.status === "paid" || data.status === "pending" || data.status === "ignored") {
      return data.status;
    }
    return "error";
  } catch (error) {
    console.error("[confirmCheckoutPurchase] failed:", error);
    return "error";
  }
}
