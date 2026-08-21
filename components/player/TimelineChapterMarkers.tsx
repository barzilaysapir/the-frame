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
 * Clickable dots on the seek bar at each chapter time. The chip row above
 * still lists labels; these are the positional cues on the timeline itself.
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
            className="pointer-events-auto absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-cyan"
            style={{ left: `${percent}%` }}
          >
            <span
              className={cn(
                "block h-2.5 w-2.5 rounded-full border transition-[transform,background-color,border-color]",
                active
                  ? "scale-125 border-frame-magenta bg-frame-magenta"
                  : "border-white/90 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)] hover:scale-125 hover:border-frame-magenta hover:bg-frame-magenta",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
