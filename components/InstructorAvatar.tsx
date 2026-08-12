import Image from "next/image";
import { cn } from "@/lib/utils";

interface InstructorAvatarProps {
  name: string;
  src?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

export function InstructorAvatar({ name, src, className }: InstructorAvatarProps) {
  const sizeClass = className ?? "h-9 w-9";

  if (src) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-full border border-frame-border",
          sizeClass
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes="48px"
          className="object-cover object-top"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-frame-border bg-gradient-to-br from-frame-panel to-black text-xs font-semibold text-white",
        sizeClass
      )}
    >
      {getInitials(name)}
    </span>
  );
}
