"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoutineFilterMultiSelectOption {
  label: string;
  value: string;
  active: boolean;
}

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

  const selectedOptions = options.filter((option) => option.active);
  const hasActive = selectedOptions.length > 0;

  const normalizedQuery = showSearch ? query.trim().toLowerCase() : "";
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setQuery("");
      }}
    >
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5 rounded-full border py-1 ps-1 pe-1 transition-colors",
          hasActive
            ? "border-frame-cyan/70 bg-frame-cyan/15"
            : "border-frame-border bg-frame-bg/60 hover:border-white/40",
        )}
      >
        {hasActive ? (
          <>
            {selectedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggle(option.value)}
                aria-label={optionRemoveAriaLabel(option.label)}
                className="inline-flex max-w-[9rem] items-center gap-1 rounded-full bg-frame-cyan/20 ps-2.5 pe-1.5 py-1 text-xs font-medium text-frame-cyan transition-colors hover:bg-frame-cyan/30"
              >
                <span className="truncate">{option.label}</span>
                <X aria-hidden="true" className="h-3 w-3 shrink-0" />
              </button>
            ))}
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

      {/* Portaled to document.body so it isn't clipped by page content and gets Radix's collision-aware positioning + focus/dismiss handling for free. */}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-30 w-64 overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl"
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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchAriaLabel}
                className="w-full rounded-lg bg-transparent py-1.5 ps-7 pe-2 text-sm text-white placeholder:text-frame-muted focus:outline-none"
              />
            </div>
          ) : null}
          <ul role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto py-1">
            <li role="none">
              <button
                type="button"
                onClick={onClear}
                role="option"
                aria-selected={!hasActive}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors hover:bg-white/5",
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
              filteredOptions.map((option) => (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    onClick={() => onToggle(option.value)}
                    role="option"
                    aria-selected={option.active}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors hover:bg-white/5",
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
