import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

/**
 * Favorites moved under /account as its own tab (alongside library/profile/
 * settings), since it's account-scoped like the rest of that section. This
 * keeps the pre-existing /favorites URL working for anyone with it bookmarked.
 */
export default async function FavoritesRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localePath(isLocale(locale) ? locale : "he", "/account/favorites"));
}
