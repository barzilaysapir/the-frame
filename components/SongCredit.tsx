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
    <TitleTag
      dir="ltr"
      className={
        isHero
          ? "text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl"
          : "font-display text-2xl font-black text-white"
      }
    >
      {songName}
      <span
        className={
          isHero
            ? "mx-3 font-sans text-3xl font-light text-frame-muted sm:mx-4 sm:text-4xl"
            : "mx-2 font-sans text-lg font-light text-frame-muted"
        }
        aria-hidden="true"
      >
        /
      </span>
      <span
        className={
          isHero
            ? "font-sans text-2xl font-medium text-frame-silver sm:text-3xl"
            : "font-sans text-base font-medium text-frame-silver"
        }
      >
        {artist}
      </span>
    </TitleTag>
  );
}
