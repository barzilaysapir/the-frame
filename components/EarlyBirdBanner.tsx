"use client";

import { useMemo, useSyncExternalStore } from "react";
import { formatMessage } from "@/lib/i18n/get-dictionary";

interface EarlyBirdBannerProps {
  endsAt: string;
  spotsRemaining?: number;
  totalSpots?: number;
  labels: {
    title: string;
    discount: string;
    forFirst: string;
    aria: string;
    spots: string;
    unitDays: string;
    unitHours: string;
    unitMinutes: string;
    unitSeconds: string;
  };
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

function getSecondsLeft(endsAt: string): number {
  return Math.floor(getMsLeft(endsAt) / 1000);
}

const clientSnapshots = new Map<string, number>();

function getClientSecondsLeft(endsAt: string): number {
  const cached = clientSnapshots.get(endsAt);
  if (cached !== undefined) return cached;
  const next = getSecondsLeft(endsAt);
  clientSnapshots.set(endsAt, next);
  return next;
}

function subscribeToEndsAt(endsAt: string, onStoreChange: () => void) {
  if (!clientSnapshots.has(endsAt)) {
    clientSnapshots.set(endsAt, getSecondsLeft(endsAt));
  }

  const interval = setInterval(() => {
    const next = getSecondsLeft(endsAt);
    if (clientSnapshots.get(endsAt) === next) return;
    clientSnapshots.set(endsAt, next);
    onStoreChange();
  }, 1000);

  return () => clearInterval(interval);
}

export function EarlyBirdBanner({
  endsAt,
  spotsRemaining = 12,
  totalSpots = 50,
  labels,
}: EarlyBirdBannerProps) {
  const secondsLeft = useSyncExternalStore(
    (onStoreChange) => subscribeToEndsAt(endsAt, onStoreChange),
    () => getClientSecondsLeft(endsAt),
    () => null,
  );
  const timeLeft = useMemo(
    () => (secondsLeft === null ? null : msToTimeLeft(secondsLeft * 1000)),
    [secondsLeft],
  );

  const units: { label: string; value: number }[] = timeLeft
    ? [
        { label: labels.unitDays, value: timeLeft.days },
        { label: labels.unitHours, value: timeLeft.hours },
        { label: labels.unitMinutes, value: timeLeft.minutes },
        { label: labels.unitSeconds, value: timeLeft.seconds },
      ]
    : [];

  return (
    <div className="border-y border-frame-border bg-frame-panel">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-start lg:px-8">
        <p className="text-sm font-semibold text-white">
          {labels.title}{" "}
          <span className="text-frame-magenta">{labels.discount}</span>
          <span className="ms-1 hidden font-normal text-frame-silver sm:inline">
            {formatMessage(labels.forFirst, { count: totalSpots })}
          </span>
        </p>

        <div className="flex items-center gap-5">
          <div
            dir="ltr"
            className="flex items-baseline gap-1"
            aria-live="polite"
            aria-label={labels.aria}
          >
            {units.map((unit, i) => (
              <div key={unit.label} className="flex items-baseline gap-1">
                {i > 0 ? <span className="text-frame-border">:</span> : null}
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
            {formatMessage(labels.spots, {
              remaining: spotsRemaining,
              total: totalSpots,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
