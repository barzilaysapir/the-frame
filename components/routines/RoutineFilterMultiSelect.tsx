"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoutineFilterMultiSelectOption {
  label: string;
  value: string;
  active: boolean;
}

// Matches gap-1.5. Reserve is a conservative estimate for the "+N" badge —
// fixed rather than measured, so its own (count-dependent) width can't
// change how many chips get counted as fitting in the first place.
const CHIP_GAP_PX = 6;
const OVERFLOW_BADGE_RESERVE_PX = 44;

// useLayoutEffect warns on the server (no DOM to measure); this component
// is server-rendered on first load, so fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface RoutineFilterMultiSelectProps {
  label: string;
  options: RoutineFilterMultiSelectOption[];
  /** Toggles a single option on/off within the current selection. */
  onToggle: (value: string) => void;
  placeholder: string;
  optionRemoveAriaLabel: (optionLabel: string) => string;
  /** Shows a search box above the option list. Defaults to true; set false for short option lists (style/level). */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  noMatchesLabel?: string;
}

export function RoutineFilterMultiSelect({
  label,
  options,
  onToggle,
  placeholder,
  optionRemoveAriaLabel,
  showSearch = true,
  searchPlaceholder,
  searchAriaLabel,
  noMatchesLabel,
}: RoutineFilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const idPrefix = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRowRef = useRef<HTMLDivElement>(null);
  // Snapshot of value -> position, selected options first, taken once when
  // the dropdown opens. Toggling options afterward doesn't recompute this,
  // so nothing moves out from under the cursor mid-session (that reordering
  // was what caused the whole page to jump scroll position earlier).
  const [openOrder, setOpenOrder] = useState<Map<string, number>>(new Map());

  const selectedOptions = options.filter((option) => option.active);
  const hasActive = selectedOptions.length > 0;
  const [visibleChipCount, setVisibleChipCount] = useState(selectedOptions.length);

  // Fits as many chips as the row's actual measured width allows (any
  // remainder collapses into a "+N" badge) instead of a fixed count, so a
  // lone wide filter shows more and a cramped one shows fewer — while never
  // growing taller than its siblings, since the row itself stays one line.
  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    const measureRow = measureRowRef.current;
    if (!row || !measureRow || selectedOptions.length === 0) {
      setVisibleChipCount(0);
      return;
    }

    function recompute() {
      const available = row!.clientWidth;
      const chevron = measureRow!.querySelector<HTMLElement>('[data-measure="chevron"]');
      let used = (chevron?.offsetWidth ?? 32) + CHIP_GAP_PX;
      const chipNodes = Array.from(
        measureRow!.querySelectorAll<HTMLElement>('[data-measure="chip"]'),
      );

      let count = 0;
      for (let i = 0; i < chipNodes.length; i++) {
        const width = chipNodes[i].offsetWidth + CHIP_GAP_PX;
        const reserve = i < chipNodes.length - 1 ? OVERFLOW_BADGE_RESERVE_PX : 0;
        if (count > 0 && used + width + reserve > available) break;
        used += width;
        count++;
      }
      setVisibleChipCount(Math.max(count, 1));
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(row);
    return () => observer.disconnect();
  }, [selectedOptions]);

  const visibleChips = selectedOptions.slice(0, visibleChipCount);
  const hiddenChipCount = selectedOptions.length - visibleChips.length;

  const normalizedQuery = showSearch ? query.trim().toLowerCase() : "";
  const matchingOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;
  const filteredOptions = [...matchingOptions].sort(
    (a, b) => (openOrder.get(a.value) ?? Infinity) - (openOrder.get(b.value) ?? Infinity),
  );
  const navCount = filteredOptions.length;

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-nav-index="${highlightedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  function activateHighlighted() {
    const option = filteredOptions[highlightedIndex];
    if (option) onToggle(option.value);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((index) => Math.min(index + 1, navCount - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(navCount - 1);
        break;
      case "Enter":
        event.preventDefault();
        activateHighlighted();
        break;
      case "Backspace":
        // Standard tag-input convention: an empty search backspaces the
        // last-selected chip instead of doing nothing.
        if (query === "" && selectedOptions.length > 0) {
          onToggle(selectedOptions[selectedOptions.length - 1].value);
        }
        break;
      default:
        break;
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setQuery("");
      setHighlightedIndex(0);
      setOpenOrder(
        new Map(
          [...options]
            .sort((a, b) => Number(b.active) - Number(a.active))
            .map((option, index) => [option.value, index]),
        ),
      );
    }
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
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
            if (event.target === event.currentTarget) handleOpenChange(!isOpen);
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

      {/* Portaled to document.body so it isn't clipped by page content and gets Radix's collision-aware positioning + focus/dismiss handling for free. */}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-30 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl"
        >
          {showSearch ? (
            <div className="relative border-b border-frame-border p-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frame-muted"
              />
              <input
                autoFocus
                type="text"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-controls={`${idPrefix}-listbox`}
                aria-activedescendant={`${idPrefix}-option-${highlightedIndex}`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchAriaLabel}
                className="w-full rounded-lg bg-transparent py-1.5 ps-7 pe-2 text-sm text-white placeholder:text-frame-muted focus:outline-none"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            id={`${idPrefix}-listbox`}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-frame-muted" role="none">
                {noMatchesLabel}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    id={`${idPrefix}-option-${index}`}
                    data-nav-index={index}
                    onClick={() => onToggle(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={option.active}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors",
                      highlightedIndex === index && "bg-white/10",
                      option.active ? "text-frame-cyan" : "text-white/80",
                    )}
                  >
                    <Check
                      aria-hidden="true"
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        option.active ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
