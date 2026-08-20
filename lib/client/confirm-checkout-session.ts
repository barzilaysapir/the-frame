import type { User } from "firebase/auth";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";

/**
 * Asks the server to retrieve a Stripe Checkout Session and mark the
 * matching purchase paid when Stripe says it is. Used after Stripe
 * redirects back with `session_id` so access unlocks without waiting
 * on the webhook.
 */
export async function confirmCheckoutSession(
  user: User,
  sessionId: string,
): Promise<"paid" | "pending" | "ignored" | "error"> {
  try {
    const res = await fetchWithAuth(user, "/api/v1/me/purchases/confirm", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return "error";
    const data = (await res.json()) as { status?: string };
    if (data.status === "paid" || data.status === "pending" || data.status === "ignored") {
      return data.status;
    }
    return "error";
  } catch (error) {
    console.error("[confirmCheckoutSession] failed:", error);
    return "error";
  }
}
