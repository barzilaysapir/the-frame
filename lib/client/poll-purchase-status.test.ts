import { afterEach, describe, expect, it, vi } from "vitest";
import { startPurchaseStatusPoll } from "@/lib/client/poll-purchase-status";

describe("startPurchaseStatusPoll", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onPaid when a check returns paid", async () => {
    const onPaid = vi.fn();
    const stop = startPurchaseStatusPoll({
      check: async () => "paid",
      onPaid,
      intervalMs: 60_000,
      timeoutMs: 120_000,
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(onPaid).toHaveBeenCalledTimes(1);
    stop();
  });

  it("does not call onPaid while status is none", async () => {
    const onPaid = vi.fn();
    const stop = startPurchaseStatusPoll({
      check: async () => "none",
      onPaid,
      intervalMs: 60_000,
      timeoutMs: 120_000,
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(onPaid).not.toHaveBeenCalled();
    stop();
  });
});
