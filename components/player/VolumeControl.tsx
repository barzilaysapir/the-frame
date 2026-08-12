import type { ChangeEvent, CSSProperties } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  labels: {
    mute: string;
    unmute: string;
    volume: string;
  };
  onToggleMute: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function VolumeControl({
  volume,
  isMuted,
  labels,
  onToggleMute,
  onVolumeChange,
}: VolumeControlProps) {
  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? labels.unmute : labels.mute}
        className="flex h-8 w-8 items-center justify-center text-frame-silver transition-colors hover:text-white"
      >
        <VolumeIcon className="h-4 w-4" />
      </button>
      <input
        type="range"
        className="frame-range w-16 cursor-pointer"
        style={{ "--range-progress": `${volumePercent}%` } as CSSProperties}
        min={0}
        max={1}
        step={0.05}
        value={isMuted ? 0 : volume}
        onChange={onVolumeChange}
        aria-label={labels.volume}
      />
    </div>
  );
}

export default VolumeControl;
