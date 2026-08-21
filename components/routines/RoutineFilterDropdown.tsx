"use client";

import { Command } from "cmdk";
import * as Popover from "@radix-ui/react-popover";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoutineFilterMultiSelectOption } from "@/components/routines/routineFilterTypes";

interface RoutineFilterDropdownProps {
  label: string;
  orderedOptions: RoutineFilterMultiSelectOption[];
  onToggle: (value: string) => void;
  hasActive: boolean;
  onClear: () => void;
  clearLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  onBackspaceEmpty: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  noMatchesLabel?: string;
}

/**
 * The popover's contents: cmdk owns search filtering, arrow/Enter keyboard
 * navigation, and combobox ARIA wiring (activedescendant, roles) — all
 * hand-rolled here before, and the source of most of the bugs chased
 * earlier (a re-sort dragging the page's scroll position, drifting
 * aria-activedescendant ids, etc.).
 */
export function RoutineFilterDropdown({
  label,
  orderedOptions,
  onToggle,
  hasActive,
  onClear,
  clearLabel,
  query,
  onQueryChange,
  onBackspaceEmpty,
  showSearch,
  searchPlaceholder,
  searchAriaLabel,
  noMatchesLabel,
}: RoutineFilterDropdownProps) {
  // Always mounted, visibility toggled instead of conditionally rendered —
  // so selecting/deselecting the last option doesn't shift the search box's
  // width (or, without search, pop the whole header row in and out).
  const clearButton = (
    <button
      type="button"
      onClick={onClear}
      tabIndex={hasActive ? 0 : -1}
      aria-hidden={!hasActive}
      className={cn(
        "shrink-0 text-xs font-medium text-frame-cyan transition-colors hover:text-white",
        !hasActive && "invisible pointer-events-none",
      )}
    >
      {clearLabel}
    </button>
  );

  return (
    // Portaled to document.body so it isn't clipped by page content and gets
    // Radix's collision-aware positioning + focus/dismiss handling for free.
    <Popover.Portal>
      <Popover.Content
        align="start"
        sideOffset={8}
        className="z-30 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl"
      >
        <Command label={label} className="flex flex-col bg-transparent">
          {/* Always has real content (search box, or the filter's own name)
              so the row never reads as an empty strip — only the clear
              button's visibility changes, keeping this row's layout fixed
              regardless of what's selected. */}
          <div className="flex items-center gap-2 border-b border-frame-border p-2">
            {showSearch ? (
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frame-muted"
                />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={onQueryChange}
                  onKeyDown={(event) => {
                    // Standard tag-input convention: an empty search
                    // backspaces the last-selected chip instead of doing
                    // nothing. Arrow/Enter/Escape are handled by cmdk itself.
                    if (event.key === "Backspace" && query === "") onBackspaceEmpty();
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchAriaLabel}
                  className="w-full rounded-lg bg-transparent py-1.5 ps-9 pe-2 text-sm text-white placeholder:text-frame-muted focus:outline-none"
                />
              </div>
            ) : (
              <span className="flex-1 px-2 text-xs font-semibold text-frame-muted">{label}</span>
            )}
            {clearButton}
          </div>
          <Command.List className="max-h-60 overflow-y-auto py-1">
            <Command.Empty className="px-3 py-2 text-sm text-frame-muted">
              {noMatchesLabel}
            </Command.Empty>
            {orderedOptions.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                keywords={[option.label]}
                onSelect={() => onToggle(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-start text-sm transition-colors",
                  "data-[selected=true]:bg-white/10",
                  option.active ? "text-frame-cyan" : "text-white/80",
                )}
              >
                <Check
                  aria-hidden="true"
                  className={cn("h-3.5 w-3.5 shrink-0", option.active ? "opacity-100" : "opacity-0")}
                />
                <span className="truncate">{option.label}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover.Portal>
  );
}
