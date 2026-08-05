"use client";

import { useEffect, useState } from "react";

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

function getTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function EarlyBirdBanner({
  endsAt,
  spotsRemaining = 12,
  totalSpots = 50,
}: EarlyBirdBannerProps) {
  // Start null so the server-rendered markup and first client render match;
  // the real countdown fills in after mount (avoids a Date.now() hydration mismatch).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(endsAt));
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

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
          השקה מוקדמת — <span className="text-frame-gold">50% הנחה</span>
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
