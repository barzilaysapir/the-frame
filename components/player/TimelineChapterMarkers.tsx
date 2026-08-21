"use client";

import { cn, formatTime } from "@/lib/utils";
import type { PlayerChapter } from "@/components/player/types";

interface TimelineChapterMarkersProps {
  chapters: PlayerChapter[];
  duration: number;
  activeChapterId: string;
  onJumpToChapter: (chapter: PlayerChapter) => void;
}

/**
 * Chapter boundary dividers on the seek bar — thin ticks (YouTube-style),
 * not dots, so the bar itself reads as segmented. Each sits inside a much
 * larger invisible hit area than its visual mark: a 3px tick is unusable as
 * a touch target on its own, so the button padding does the tapping work
 * while the tick stays visually unobtrusive.
 */
export function TimelineChapterMarkers({
  chapters,
  duration,
  activeChapterId,
  onJumpToChapter,
}: TimelineChapterMarkersProps) {
  if (!duration || chapters.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] h-0 -translate-y-1/2">
      {chapters.map((chapter) => {
        const percent = Math.min(
          100,
          Math.max(0, (chapter.time / duration) * 100),
        );
        // Skip the very start — it sits under the thumb and reads as clutter.
        if (percent < 0.5) return null;
        const active = activeChapterId === chapter.id;
        return (
          <button
            key={chapter.id}
            type="button"
            title={`${chapter.label} · ${formatTime(chapter.time)}`}
            aria-label={`${chapter.label}, ${formatTime(chapter.time)}`}
            aria-current={active ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onJumpToChapter(chapter);
            }}
            className="pointer-events-auto absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-cyan"
            style={{ left: `${percent}%` }}
          >
            <span
              className={cn(
                "block w-[3px] rounded-full transition-[transform,background-color,height]",
                active
                  ? "h-3.5 bg-frame-magenta"
                  : "h-1.5 bg-frame-bg",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
