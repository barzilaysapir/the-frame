import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

/**
 * Settings merged into /account/profile — not enough content for two tabs.
 * Keep this URL working for anyone with it bookmarked.
 */
export default async function AccountSettingsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localePath(isLocale(locale) ? locale : "he", "/account/profile"));
}
