"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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

  return (
    <DropdownMenu.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      dir="ltr"
      modal={false}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={labels.speed}
          className={cn(
            "flex h-8 w-[4.25rem] shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-semibold tabular-nums transition-colors",
            isOpen
              ? "border-frame-magenta text-frame-magenta"
              : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
          )}
        >
          <Gauge className="h-3.5 w-3.5" />
          {playbackRate}x
        </button>
      </DropdownMenu.Trigger>

      {/*
       * `modal={false}` skips Radix's body scroll-lock (padding-right / overflow
       * hidden), which was shifting the whole player chrome when the menu opened.
       * Portaled to document.body so the flyout isn't clipped by overflow-hidden
       * on the player. `dir="ltr"` pins it to the trigger regardless of locale.
       */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="end"
          sideOffset={8}
          className="z-30 flex flex-col overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl"
        >
          <DropdownMenu.RadioGroup
            value={String(playbackRate)}
            onValueChange={(value) => onChangeSpeed(Number(value))}
          >
            {PLAYBACK_SPEEDS.map((speed) => (
              <DropdownMenu.RadioItem
                key={speed}
                value={String(speed)}
                className={cn(
                  "cursor-pointer px-4 py-2 text-start text-xs font-medium whitespace-nowrap outline-none transition-colors hover:bg-white/5",
                  playbackRate === speed ? "text-frame-magenta" : "text-white/80"
                )}
              >
                {speed}x{speed === 1 ? ` · ${labels.normalSpeed}` : ""}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
