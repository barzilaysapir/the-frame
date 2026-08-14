"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals more of an already-in-memory list as a sentinel scrolls into view,
 * instead of rendering all of it up front. `reset()` is exposed for callers
 * (e.g. a filter change) that need pagination to start over.
 */
export function useInfiniteReveal(totalCount: number, pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, totalCount));
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, pageSize, totalCount]);

  return {
    visibleCount,
    hasMore,
    sentinelRef,
    reset: () => setVisibleCount(pageSize),
  };
}
