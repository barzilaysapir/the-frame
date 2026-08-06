import { cn } from "@/lib/utils";

interface InstructorAvatarProps {
  name: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function InstructorAvatar({ name, className }: InstructorAvatarProps) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-frame-border bg-gradient-to-br from-frame-panel to-black text-xs font-semibold text-white",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export default InstructorAvatar;
