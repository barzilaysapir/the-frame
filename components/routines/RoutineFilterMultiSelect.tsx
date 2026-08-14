"use client";

import { useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoutineFilterMultiSelectOption {
  label: string;
  /** href resulting from toggling this option on/off within the current selection. */
  href: string;
  active: boolean;
}

interface RoutineFilterMultiSelectProps {
  label: string;
  options: RoutineFilterMultiSelectOption[];
  /** href with this filter dimension cleared entirely. */
  allHref: string;
  allLabel: string;
  /** Precomputed summary shown on the closed trigger (e.g. "All", a single name, or "{n} selected"). */
  triggerLabel: string;
  /** Shows a search box above the option list. Defaults to true; set false for short option lists (style/level). */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  noMatchesLabel?: string;
}

export function RoutineFilterMultiSelect({
  label,
  options,
  allHref,
  allLabel,
  triggerLabel,
  showSearch = true,
  searchPlaceholder,
  searchAriaLabel,
  noMatchesLabel,
}: RoutineFilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const hasActive = options.some((option) => option.active);

  const normalizedQuery = showSearch ? query.trim().toLowerCase() : "";
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;
  // Selected options surface at the top so an open dropdown makes the
  // current selection obvious at a glance; stable sort keeps each group's
  // relative order otherwise unchanged.
  const sortedOptions = [...filteredOptions].sort(
    (a, b) => Number(b.active) - Number(a.active),
  );

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setQuery("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-full border py-1.5 ps-4 pe-3 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-cyan/70",
            hasActive
              ? "border-frame-cyan/70 bg-frame-cyan/15 text-frame-cyan"
              : "border-frame-border bg-frame-bg/60 text-frame-silver hover:border-white/40 hover:text-white",
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </Popover.Trigger>

      {/*
       * Portaled straight to document.body: this popover no longer has to
       * out-rank arbitrary page content (routine card badges, etc.) via
       * z-index gymnastics — it simply isn't a descendant of any of it.
       * Radix also gives us collision-aware positioning, focus trap/return,
       * and outside-click + Escape dismissal for free.
       */}
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
              <Link
                href={allHref}
                role="option"
                aria-selected={!hasActive}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5",
                  !hasActive ? "text-frame-cyan" : "text-frame-silver",
                )}
              >
                <Check
                  aria-hidden="true"
                  className={cn("h-3.5 w-3.5 shrink-0", !hasActive ? "opacity-100" : "opacity-0")}
                />
                {allLabel}
              </Link>
            </li>
            {sortedOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-frame-muted" role="none">
                {noMatchesLabel}
              </li>
            ) : (
              sortedOptions.map((option) => (
                <li key={option.href} role="none">
                  <Link
                    href={option.href}
                    role="option"
                    aria-selected={option.active}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5",
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
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
