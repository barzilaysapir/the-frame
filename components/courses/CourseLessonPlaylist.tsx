import { cn } from "@/lib/utils";
import type { CatalogExternalCourseLesson } from "@/lib/server/catalog/types";

interface CourseLessonPlaylistProps {
  lessons: CatalogExternalCourseLesson[];
  selectedLessonId: string;
  onSelect: (lessonId: string) => void;
  heading: string;
}

export function CourseLessonPlaylist({
  lessons,
  selectedLessonId,
  onSelect,
  heading,
}: CourseLessonPlaylistProps) {
  return (
    <nav aria-labelledby="course-lessons-heading">
      <h2
        id="course-lessons-heading"
        className="mb-3 font-display text-lg font-bold text-white"
      >
        {heading}
      </h2>
      <ol className="divide-y divide-frame-border border border-frame-border">
        {lessons.map((lesson, index) => {
          const selected = lesson.id === selectedLessonId;
          return (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => onSelect(lesson.id)}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex w-full items-baseline gap-3 px-4 py-3 text-start transition-colors",
                  selected
                    ? "bg-white/10 text-white"
                    : "text-frame-silver hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="w-6 shrink-0 font-mono text-xs text-frame-muted">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold">{lesson.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
