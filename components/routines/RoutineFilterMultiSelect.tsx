"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const hasActive = options.some((option) => option.active);

  // Close on an outside click or Escape (returning focus to the trigger),
  // matching the SpeedMenu dismissal pattern used by the video player.
  useEffect(() => {
    if (!isOpen) return;
    if (showSearch) inputRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
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
  }, [isOpen, showSearch]);

  const openMenu = () => {
    setQuery("");
    setIsOpen(true);
  };

  const normalizedQuery = showSearch ? query.trim().toLowerCase() : "";
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
      <p className="w-14 shrink-0 text-xs font-semibold text-frame-muted">{label}</p>
      <div className="relative inline-block" ref={containerRef}>
        <button
          type="button"
          ref={buttonRef}
          onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-full border py-1.5 ps-4 pe-3 text-sm font-medium transition-colors sm:w-56",
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

        {isOpen ? (
          <div className="absolute start-0 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl">
            {showSearch ? (
              <div className="relative border-b border-frame-border p-2">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute start-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frame-muted"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchAriaLabel}
                  className="w-full rounded-lg bg-transparent py-1.5 ps-7 pe-2 text-sm text-white placeholder:text-frame-muted focus:outline-none"
                />
              </div>
            ) : null}
            <ul
              role="listbox"
              aria-multiselectable="true"
              id={listId}
              className="max-h-60 overflow-y-auto py-1"
            >
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
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-frame-muted" role="none">
                  {noMatchesLabel}
                </li>
              ) : (
                filteredOptions.map((option) => (
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
