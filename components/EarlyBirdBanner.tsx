"use client";

import { useMemo, useSyncExternalStore } from "react";

interface EarlyBirdBannerProps {
  /** ISO timestamp the early-bird pricing window closes. */
  endsAt: string;
  spotsRemaining?: number;
  totalSpots?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getMsLeft(endsAt: string): number {
  return Math.max(0, new Date(endsAt).getTime() - Date.now());
}

function msToTimeLeft(diff: number): TimeLeft {
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function subscribeToClockTick(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

// Cache the client snapshot so React's getSnapshot stays referentially stable
// between ticks (returning a fresh number every call triggers an infinite loop).
const clientSnapshots = new Map<string, number>();

function getClientMsLeft(endsAt: string): number {
  const cached = clientSnapshots.get(endsAt);
  if (cached !== undefined) return cached;
  const next = getMsLeft(endsAt);
  clientSnapshots.set(endsAt, next);
  return next;
}

function subscribeToEndsAt(endsAt: string, callback: () => void) {
  const tick = () => {
    clientSnapshots.set(endsAt, getMsLeft(endsAt));
    callback();
  };
  tick();
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}

export function EarlyBirdBanner({
  endsAt,
  spotsRemaining = 12,
  totalSpots = 50,
}: EarlyBirdBannerProps) {
  const msLeft = useSyncExternalStore(
    (onStoreChange) => subscribeToEndsAt(endsAt, onStoreChange),
    () => getClientMsLeft(endsAt),
    () => null
  );
  const timeLeft = useMemo(
    () => (msLeft === null ? null : msToTimeLeft(msLeft)),
    [msLeft]
  );

  const units: { label: string; value: number }[] = timeLeft
    ? [
        { label: "ימים", value: timeLeft.days },
        { label: "שעות", value: timeLeft.hours },
        { label: "דקות", value: timeLeft.minutes },
        { label: "שניות", value: timeLeft.seconds },
      ]
    : [];

  return (
    <div className="border-y border-frame-border bg-frame-panel">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-start lg:px-8">
        <p className="text-sm font-semibold text-white">
          השקה מוקדמת — <span className="text-frame-magenta">50% הנחה</span>
          <span className="ms-1 hidden font-normal text-frame-silver sm:inline">
            ל-{totalSpots} הרקדנים הראשונים
          </span>
        </p>

        <div className="flex items-center gap-5">
          <div
            dir="ltr"
            className="flex items-baseline gap-1"
            aria-live="polite"
            aria-label="זמן שנותר למחיר ההשקה המוקדמת"
          >
            {units.map((unit, i) => (
              <div key={unit.label} className="flex items-baseline gap-1">
                {i > 0 && <span className="text-frame-border">:</span>}
                <div className="flex flex-col items-center">
                  <span className="font-display text-lg font-bold leading-none tabular-nums text-white">
                    {unit.value.toString().padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[9px] text-frame-muted">
                    {unit.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <span className="hidden h-7 w-px bg-frame-border md:block" />

          <p className="hidden text-xs font-medium text-frame-silver md:block">
            {spotsRemaining} מתוך {totalSpots} מקומות נותרו
          </p>
        </div>
      </div>
    </div>
  );
}

export default EarlyBirdBanner;
