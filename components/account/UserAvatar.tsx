"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  photoURL?: string | null;
  className?: string;
}

export function UserAvatar({ name, photoURL, className }: UserAvatarProps) {
  const initial = name.trim().charAt(0) || "?";

  if (photoURL) {
    return (
      // External Google avatar URLs — plain img avoids Next image host config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name}
        width={48}
        height={48}
        referrerPolicy="no-referrer"
        className={cn(
          "h-12 w-12 shrink-0 rounded-full border border-frame-border object-cover",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-frame-border bg-frame-panel text-sm font-semibold text-white",
        className,
      )}
    >
      {initial}
    </span>
  );
}

export default UserAvatar;
