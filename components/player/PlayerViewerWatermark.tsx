/**
 * Visible account label so a leaked screen recording is traceable.
 * CSS only — a saved MP4 file does not include this text.
 */
export function PlayerViewerWatermark({ label }: { label: string }) {
  return (
    <p
      className="pointer-events-none absolute bottom-14 left-3 right-3 z-[1] truncate text-center text-[10px] font-medium tracking-wide text-white/55 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:bottom-16 sm:text-[11px]"
      aria-hidden="true"
    >
      {label}
    </p>
  );
}
