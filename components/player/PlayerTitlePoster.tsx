interface PlayerTitlePosterProps {
  title: string;
  show: boolean;
}

/**
 * Placeholder “poster” for players that have no cover image yet: a large
 * title on the dark video surface. Decorative only — the player already
 * exposes the title to assistive tech.
 */
export function PlayerTitlePoster({ title, show }: PlayerTitlePosterProps) {
  if (!show || !title) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/25"
    >
      <p className="absolute inset-x-0 top-[16%] px-6 text-balance text-center font-display text-2xl font-black leading-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
        {title}
      </p>
    </div>
  );
}
