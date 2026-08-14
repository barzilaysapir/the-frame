"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoutineFilterMultiSelectOption {
  label: string;
  value: string;
  active: boolean;
}

const MAX_VISIBLE_CHIPS = 1;

interface RoutineFilterMultiSelectProps {
  label: string;
  options: RoutineFilterMultiSelectOption[];
  /** Toggles a single option on/off within the current selection. */
  onToggle: (value: string) => void;
  /** Clears this filter dimension entirely. */
  onClear: () => void;
  allLabel: string;
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
  onClear,
  allLabel,
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

  const selectedOptions = options.filter((option) => option.active);
  const hasActive = selectedOptions.length > 0;
  // Caps the trigger to one line regardless of selection count, so this
  // filter never grows taller than its siblings in the grid row.
  const visibleChips = selectedOptions.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenChipCount = selectedOptions.length - visibleChips.length;

  const normalizedQuery = showSearch ? query.trim().toLowerCase() : "";
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;
  // Index 0 is the "All" row; option rows follow at 1..N, so arrow/Enter
  // navigation and mouse hover can share one flat index.
  const navCount = filteredOptions.length + 1;

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-nav-index="${highlightedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  function activateHighlighted() {
    if (highlightedIndex === 0) {
      onClear();
      return;
    }
    const option = filteredOptions[highlightedIndex - 1];
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
      default:
        break;
    }
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setQuery("");
          setHighlightedIndex(0);
        }
      }}
    >
      {/* Anchor, not just Trigger: the small chevron trigger button below isn't
          a stable position reference on its own — anchoring here keeps the
          popover aligned to the whole (fixed-height) row. */}
      <Popover.Anchor asChild>
        <div
          className={cn(
            "flex w-full items-center gap-1.5 border py-1 ps-1 pe-1 transition-colors",
            hasActive
              ? "rounded-full border-frame-cyan/70 bg-frame-cyan/15"
              : "rounded-full border-frame-border bg-frame-bg/60 hover:border-white/40",
          )}
        >
          {hasActive ? (
            <>
              {visibleChips.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  aria-label={optionRemoveAriaLabel(option.label)}
                  className="inline-flex max-w-[7rem] shrink-0 items-center gap-1 rounded-full bg-frame-cyan/20 ps-2.5 pe-1.5 py-1 text-xs font-medium text-frame-cyan transition-colors hover:bg-frame-cyan/30"
                >
                  <span className="truncate">{option.label}</span>
                  <X aria-hidden="true" className="h-3 w-3 shrink-0" />
                </button>
              ))}
              {hiddenChipCount > 0 ? (
                <span className="shrink-0 rounded-full bg-frame-cyan/10 px-2 py-1 text-xs font-medium text-frame-cyan">
                  +{hiddenChipCount}
                </span>
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
            <li role="none">
              <button
                type="button"
                id={`${idPrefix}-option-0`}
                data-nav-index={0}
                onClick={onClear}
                onMouseEnter={() => setHighlightedIndex(0)}
                role="option"
                aria-selected={!hasActive}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors",
                  highlightedIndex === 0 && "bg-white/10",
                  !hasActive ? "text-frame-cyan" : "text-frame-silver",
                )}
              >
                <Check
                  aria-hidden="true"
                  className={cn("h-3.5 w-3.5 shrink-0", !hasActive ? "opacity-100" : "opacity-0")}
                />
                {allLabel}
              </button>
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-frame-muted" role="none">
                {noMatchesLabel}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    id={`${idPrefix}-option-${index + 1}`}
                    data-nav-index={index + 1}
                    onClick={() => onToggle(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index + 1)}
                    role="option"
                    aria-selected={option.active}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors",
                      highlightedIndex === index + 1 && "bg-white/10",
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
