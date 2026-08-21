import { cn } from "@/lib/utils";

interface CourseTopicChipsProps {
  topics: string[];
  className?: string;
}

const CHIP_ACCENTS = ["border-frame-magenta/40", "border-frame-cyan/40"];

export function CourseTopicChips({ topics, className }: CourseTopicChipsProps) {
  if (topics.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {topics.map((topic, index) => (
        <span
          key={topic}
          className={cn(
            "rounded-full border bg-frame-panel/40 px-3 py-1 text-xs text-frame-silver",
            CHIP_ACCENTS[index % CHIP_ACCENTS.length],
          )}
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
