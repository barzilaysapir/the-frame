import { cn } from "@/lib/utils";
import type { PlayerChapter } from "@/components/player/types";

interface ChapterMarkersProps {
  chapters: PlayerChapter[];
  activeChapterId: string;
  onJumpToChapter: (chapter: PlayerChapter) => void;
}

export function ChapterMarkers({
  chapters,
  activeChapterId,
  onJumpToChapter,
}: ChapterMarkersProps) {
  return (
    <div className="mb-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          onClick={() => onJumpToChapter(chapter)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs",
            activeChapterId === chapter.id
              ? "border-frame-magenta bg-frame-magenta/15 text-frame-magenta"
              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
          )}
        >
          {chapter.label}
        </button>
      ))}
    </div>
  );
}

export default ChapterMarkers;
