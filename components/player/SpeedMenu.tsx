"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25] as const;

interface SpeedMenuProps {
  playbackRate: number;
  labels: {
    speed: string;
    normalSpeed: string;
  };
  onChangeSpeed: (rate: number) => void;
}

export function SpeedMenu({ playbackRate, labels, onChangeSpeed }: SpeedMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on an outside click or Escape (returning focus to the trigger),
  // matching standard menu-dismissal behavior.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (speed: number) => {
    onChangeSpeed(speed);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={labels.speed}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-colors",
          isOpen
            ? "border-frame-magenta text-frame-magenta"
            : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        )}
      >
        <Gauge className="h-3.5 w-3.5" />
        {playbackRate}x
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={labels.speed}
          className="absolute bottom-10 right-0 z-10 flex flex-col overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl"
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <button
              key={speed}
              type="button"
              role="menuitemradio"
              aria-checked={playbackRate === speed}
              onClick={() => handleSelect(speed)}
              className={cn(
                "px-4 py-2 text-start text-xs font-medium whitespace-nowrap transition-colors hover:bg-white/5",
                playbackRate === speed ? "text-frame-magenta" : "text-white/80"
              )}
            >
              {speed}x{speed === 1 ? ` · ${labels.normalSpeed}` : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
