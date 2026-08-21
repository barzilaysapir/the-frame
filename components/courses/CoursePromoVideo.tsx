import { PlayerLogoWatermark } from "@/components/player/PlayerLogoWatermark";
import { cn } from "@/lib/utils";

interface CoursePromoVideoProps {
  src: string;
  poster?: string | null;
  label: string;
  className?: string;
}

/**
 * Public, ungated 9:16 promo clip. Native controls (no login, no mirror
 * chrome) — this is marketing footage, not a follow-along lesson.
 */
export function CoursePromoVideo({
  src,
  poster,
  label,
  className,
}: CoursePromoVideoProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-2xl border border-frame-border bg-black",
        className,
      )}
    >
      <video
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        preload="none"
        width={720}
        height={1280}
        className="aspect-[9/16] h-auto w-full"
        aria-label={label}
      />
      <PlayerLogoWatermark />
    </div>
  );
}
