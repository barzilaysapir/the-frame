"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Matches gap-1.5. Reserve is a conservative estimate for the "+N" badge —
// fixed rather than measured, so its own (count-dependent) width can't
// change how many chips get counted as fitting in the first place.
const CHIP_GAP_PX = 6;
const OVERFLOW_BADGE_RESERVE_PX = 44;

// useLayoutEffect warns on the server (no DOM to measure); callers are
// server-rendered on first load, so fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fits as many chips as a row's actual measured width allows (any remainder
 * collapses into a "+N" badge) instead of a fixed count, so a lone wide
 * filter shows more chips and a cramped one shows fewer.
 *
 * Returns two refs the caller must attach: `rowRef` on the visible chip row,
 * and `measureRowRef` on an off-flow clone of the full chip set (identical
 * markup, `data-measure="chip"`/`data-measure="chevron"` on the pieces to
 * measure) used only to read natural widths without affecting layout.
 */
export function useFittedChips(selectedOptions: { value: string }[]) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRowRef = useRef<HTMLDivElement>(null);
  const [visibleChipCount, setVisibleChipCount] = useState(selectedOptions.length);

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

  return { rowRef, measureRowRef, visibleChipCount };
}
