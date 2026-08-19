"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";

interface AdminPurchase {
  id: string;
  firebaseUid: string;
  itemType: string;
  itemSlug: string;
  provider: string;
  providerPaymentId: string | null;
  amountIls: number | null;
  currency: string;
  status: "pending" | "paid" | "refunded";
  createdAt: string;
  paidAt: string | null;
}

interface AdminPurchasesListProps {
  labels: {
    loading: string;
    unavailable: string;
    signInPrompt: string;
    notAuthorized: string;
    empty: string;
    markPaid: string;
    markRefunded: string;
    error: string;
    colItem: string;
    colBuyer: string;
    colAmount: string;
    colStatus: string;
    colProvider: string;
    colCreated: string;
    colActions: string;
    unverifiedBadge: string;
    unverifiedTooltip: string;
  };
}

function StateBox({ children }: { children: React.ReactNode }) {
  return <Panel className="p-8 text-center">{children}</Panel>;
}

export function AdminPurchasesList({ labels }: AdminPurchasesListProps) {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [purchases, setPurchases] = useState<AdminPurchase[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    if (!user) return null;
    const res = await fetchWithAuth(user, "/api/v1/admin/purchases");
    if (res.status === 403) return "forbidden" as const;
    if (!res.ok) throw new Error(`request failed with ${res.status}`);
    const data = (await res.json()) as { purchases: AdminPurchase[] };
    return data.purchases;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchPurchases();
        if (cancelled || result === null) return;
        if (result === "forbidden") {
          setForbidden(true);
        } else {
          setPurchases(result);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[AdminPurchasesList] failed to load purchases:", err);
        setError(labels.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchPurchases, labels.error]);

  const act = async (purchaseId: string, action: "mark_paid" | "mark_refunded") => {
    if (!user) return;
    setPendingAction(purchaseId);
    setError(null);
    try {
      const res = await fetchWithAuth(user, "/api/v1/admin/purchases", {
        method: "PATCH",
        body: JSON.stringify({ purchaseId, action }),
      });
      if (!res.ok) throw new Error(`request failed with ${res.status}`);
      const data = (await res.json()) as { purchases: AdminPurchase[] };
      setPurchases(data.purchases);
    } catch (err) {
      console.error("[AdminPurchasesList] action failed:", err);
      setError(labels.error);
    } finally {
      setPendingAction(null);
    }
  };

  if (!isConfigured) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.unavailable}</p>
      </StateBox>
    );
  }

  if (authLoading) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.loading}</p>
      </StateBox>
    );
  }

  if (!user) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.signInPrompt}</p>
      </StateBox>
    );
  }

  if (forbidden) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.notAuthorized}</p>
      </StateBox>
    );
  }

  if (purchases === null) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.loading}</p>
      </StateBox>
    );
  }

  if (purchases.length === 0) {
    return (
      <StateBox>
        <p className="text-frame-silver">{labels.empty}</p>
      </StateBox>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="text-sm font-medium text-frame-magenta">
          {error}
        </p>
      ) : null}
      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-frame-border text-frame-muted">
              <th className="px-4 py-3 font-medium">{labels.colItem}</th>
              <th className="px-4 py-3 font-medium">{labels.colBuyer}</th>
              <th className="px-4 py-3 font-medium">{labels.colAmount}</th>
              <th className="px-4 py-3 font-medium">{labels.colProvider}</th>
              <th className="px-4 py-3 font-medium">{labels.colStatus}</th>
              <th className="px-4 py-3 font-medium">{labels.colCreated}</th>
              <th className="px-4 py-3 font-medium">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-frame-border/50">
                <td className="px-4 py-3 text-white">
                  {purchase.itemType}:{purchase.itemSlug}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-frame-silver">
                  {purchase.firebaseUid}
                </td>
                <td className="px-4 py-3 text-frame-silver">
                  {purchase.amountIls != null ? `₪${purchase.amountIls}` : "—"}
                </td>
                <td className="px-4 py-3 text-frame-silver">{purchase.provider}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      purchase.status === "paid"
                        ? "text-frame-cyan"
                        : purchase.status === "refunded"
                          ? "text-frame-muted"
                          : "text-frame-magenta"
                    }
                  >
                    {purchase.status}
                  </span>
                  {purchase.status === "paid" &&
                  purchase.providerPaymentId === "upay-ipn" ? (
                    <span
                      title={labels.unverifiedTooltip}
                      className="ml-2 inline-block rounded-full border border-frame-magenta/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-frame-magenta"
                    >
                      {labels.unverifiedBadge}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-frame-silver">
                  {new Date(purchase.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {purchase.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => act(purchase.id, "mark_paid")}
                        disabled={pendingAction === purchase.id}
                        aria-busy={pendingAction === purchase.id}
                        className="px-3 py-1.5 text-xs"
                      >
                        {labels.markPaid}
                      </Button>
                      <Button
                        onClick={() => act(purchase.id, "mark_refunded")}
                        disabled={pendingAction === purchase.id}
                        aria-busy={pendingAction === purchase.id}
                        className="px-3 py-1.5 text-xs"
                      >
                        {labels.markRefunded}
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
