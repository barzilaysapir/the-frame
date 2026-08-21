/**
 * Poll GET /api/v1/me/purchases/status until paid or the timeout.
 * Used after card returnurl and after a server-side Bit request so the
 * watch UI appears once IPN/admin marks paid — never from the browser
 * return itself.
 */
export function startPurchaseStatusPoll(options: {
  check: () => Promise<"paid" | "none">;
  onPaid: () => void;
  intervalMs?: number;
  timeoutMs?: number;
}): () => void {
  const intervalMs = options.intervalMs ?? 2500;
  const timeoutMs = options.timeoutMs ?? 120_000;
  let cancelled = false;

  const run = async () => {
    if (cancelled) return;
    try {
      const status = await options.check();
      if (!cancelled && status === "paid") {
        cancelled = true;
        options.onPaid();
      }
    } catch (error) {
      console.error("[pollPurchaseStatus] check failed:", error);
    }
  };

  void run();
  const interval = setInterval(() => void run(), intervalMs);
  const stop = setTimeout(() => {
    cancelled = true;
    clearInterval(interval);
  }, timeoutMs);

  return () => {
    cancelled = true;
    clearInterval(interval);
    clearTimeout(stop);
  };
}
