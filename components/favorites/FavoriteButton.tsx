"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavorites, type FavoritableItem } from "@/components/favorites/FavoritesProvider";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  item: FavoritableItem;
  locale: Locale;
  className?: string;
  labels: {
    add: string;
    remove: string;
  };
}

export function FavoriteButton({
  item,
  locale,
  className,
  labels,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const active = isFavorited(item.itemType, item.slug);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push(localePath(locale, "/login"));
      return;
    }
    void toggleFavorite(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? labels.remove : labels.add}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "fill-frame-magenta text-frame-magenta" : "fill-none",
        )}
      />
    </button>
  );
}
