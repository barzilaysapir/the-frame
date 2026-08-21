import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Branding overlay only — not burned into the file. A downloaded MP4 will
 * not include this mark. `mix-blend-screen` drops the PNG's black square
 * so just the silver mark shows on the picture.
 */
export function PlayerLogoWatermark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-[1] mix-blend-screen",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/logos/logo-mark.png"
        alt=""
        width={36}
        height={36}
        className="h-8 w-8 opacity-70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:h-9 sm:w-9"
      />
    </div>
  );
}
