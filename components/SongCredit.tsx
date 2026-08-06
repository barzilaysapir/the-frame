interface SongCreditProps {
  songName: string;
  artist: string;
  /** Larger type for the combo page hero. */
  size?: "card" | "hero";
}

export function SongCredit({ songName, artist, size = "card" }: SongCreditProps) {
  const isHero = size === "hero";
  const TitleTag = isHero ? "h1" : "h3";

  return (
    <div dir="ltr" className="text-left">
      <TitleTag
        className={
          isHero
            ? "text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl"
            : "font-display text-2xl font-black text-white"
        }
      >
        {songName}
      </TitleTag>
      <p
        className={
          isHero
            ? "mt-3 text-sm font-medium uppercase tracking-[0.22em] text-frame-cyan sm:text-base"
            : "mt-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-frame-cyan"
        }
      >
        {artist}
      </p>
    </div>
  );
}

export default SongCredit;
