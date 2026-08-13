"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoutineCard } from "@/components/routines/RoutineCard";
import type { Locale } from "@/lib/i18n/config";
import type { CatalogPaginatedListResponse, CatalogRoutine } from "@/lib/server/catalog/types";

interface RoutineInfiniteGridProps {
  initialRoutines: CatalogRoutine[];
  initialHasMore: boolean;
  locale: Locale;
  pageSize: number;
  filters: {
    instructor?: string;
    style?: string;
    level?: string;
  };
  instructorNameBySlug: Record<string, string>;
  labels: {
    viewRoutine: string;
    taughtBy: string;
    favoriteAdd: string;
    favoriteRemove: string;
    loadingMore: string;
  };
}

/**
 * Renders the library's routine grid and loads further pages as the user
 * scrolls (IntersectionObserver on a sentinel below the grid), instead of
 * rendering all ~100 routines up front. Remount with a fresh `key` (see the
 * server page) whenever `filters` change — a full navigation already does
 * this naturally since it's a server-component boundary.
 */
export function RoutineInfiniteGrid({
  initialRoutines,
  initialHasMore,
  locale,
  pageSize,
  filters,
  instructorNameBySlug,
  labels,
}: RoutineInfiniteGridProps) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const offsetRef = useRef(initialRoutines.length);
  const isLoadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const searchParams = new URLSearchParams({
        locale,
        limit: String(pageSize),
        offset: String(offsetRef.current),
      });
      if (filters.instructor) searchParams.set("instructor", filters.instructor);
      if (filters.style) searchParams.set("style", filters.style);
      if (filters.level) searchParams.set("level", filters.level);

      const response = await fetch(`/api/v1/routines?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`Unexpected status ${response.status}`);

      const data = (await response.json()) as CatalogPaginatedListResponse<CatalogRoutine>;
      offsetRef.current += data.items.length;
      setRoutines((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to load more library routines:", error);
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [locale, pageSize, filters.instructor, filters.style, filters.level]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine, index) => (
          <RoutineCard
            key={routine.slug}
            routine={routine}
            locale={locale}
            instructorName={instructorNameBySlug[routine.instructorSlug]}
            priority={index < 3}
            labels={labels}
          />
        ))}
      </div>

      {hasMore ? <div ref={sentinelRef} aria-hidden="true" className="h-1" /> : null}

      <p aria-live="polite" className="mt-8 text-center text-sm text-frame-silver">
        {isLoading ? labels.loadingMore : null}
      </p>
    </>
  );
}
