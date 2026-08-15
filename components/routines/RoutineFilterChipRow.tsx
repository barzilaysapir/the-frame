"use client";

import type { RefObject } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoutineFilterMultiSelectOption } from "@/components/routines/routineFilterTypes";

interface RoutineFilterChipRowProps {
  label: string;
  placeholder: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  hasActive: boolean;
  selectedOptions: RoutineFilterMultiSelectOption[];
  visibleChips: RoutineFilterMultiSelectOption[];
  hiddenChipCount: number;
  onToggle: (value: string) => void;
  optionRemoveAriaLabel: (optionLabel: string) => string;
  rowRef: RefObject<HTMLDivElement | null>;
  measureRowRef: RefObject<HTMLDivElement | null>;
}

/**
 * The closed/always-visible control: either the placeholder pill, or the
 * selected chips (each individually removable) plus a "+N" overflow badge
 * and the chevron that opens the dropdown. Also renders the off-flow clone
 * `useFittedChips` measures against.
 */
export function RoutineFilterChipRow({
  label,
  placeholder,
  isOpen,
  onToggleOpen,
  hasActive,
  selectedOptions,
  visibleChips,
  hiddenChipCount,
  onToggle,
  optionRemoveAriaLabel,
  rowRef,
  measureRowRef,
}: RoutineFilterChipRowProps) {
  return (
    <>
      {/* Anchor, not just Trigger: the small chevron trigger button below isn't
          a stable position reference on its own — anchoring here keeps the
          popover aligned to the whole (fixed-height) row. */}
      <Popover.Anchor asChild>
        <div
          ref={rowRef}
          // Only when the click lands on the row's own background (not a
          // chip, the X, the badge, or the chevron — all of which stop it
          // reaching here) — so the empty space also opens the dropdown
          // without stealing clicks meant for those.
          onClick={(event) => {
            if (event.target === event.currentTarget) onToggleOpen();
          }}
          className={cn(
            "flex w-full items-center gap-1.5 border py-1 ps-1 pe-1 transition-colors",
            hasActive
              ? "cursor-pointer rounded-full border-frame-cyan/70 bg-frame-cyan/15"
              : "rounded-full border-frame-border bg-frame-bg/60 hover:border-white/40",
          )}
        >
          {hasActive ? (
            <>
              {visibleChips.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex max-w-[7rem] shrink-0 cursor-default items-center gap-0.5 rounded-full bg-frame-cyan/20 ps-2.5 pe-1 py-1 text-xs font-medium text-frame-cyan"
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    type="button"
                    onClick={() => onToggle(option.value)}
                    aria-label={optionRemoveAriaLabel(option.label)}
                    className="shrink-0 rounded-full p-1 text-frame-cyan/70 transition-colors hover:bg-frame-cyan/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-cyan/70"
                  >
                    <X aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {hiddenChipCount > 0 ? (
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    aria-label={label}
                    className="shrink-0 rounded-full bg-frame-cyan/10 px-2 py-1 text-xs font-medium text-frame-cyan transition-colors hover:bg-frame-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-cyan/70"
                  >
                    +{hiddenChipCount}
                  </button>
                </Popover.Trigger>
              ) : null}
              <Popover.Trigger asChild>
                <button
                  type="button"
                  aria-label={label}
                  className="ms-auto shrink-0 rounded-full p-1.5 text-frame-cyan transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-cyan/70"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
              </Popover.Trigger>
            </>
          ) : (
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label={label}
                className="flex w-full items-center justify-between gap-2 px-3 py-1 text-start text-sm font-medium text-frame-silver transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-cyan/70"
              >
                <span className="truncate">{placeholder}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                />
              </button>
            </Popover.Trigger>
          )}
        </div>
      </Popover.Anchor>

      {/* Off-flow clone used only to measure how many chips actually fit. */}
      <div ref={measureRowRef} aria-hidden="true" className="invisible absolute start-0 top-0 -z-10 flex gap-1.5">
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            data-measure="chip"
            className="inline-flex max-w-[7rem] shrink-0 items-center gap-0.5 rounded-full ps-2.5 pe-1 py-1 text-xs font-medium"
          >
            <span className="truncate">{option.label}</span>
            <span className="block shrink-0 rounded-full p-1">
              <span className="block h-3 w-3" />
            </span>
          </span>
        ))}
        <span data-measure="chevron" className="shrink-0 rounded-full p-1.5">
          <span className="block h-4 w-4" />
        </span>
      </div>
    </>
  );
}
