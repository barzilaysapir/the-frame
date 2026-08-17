"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { swapLocalePath } from "@/lib/i18n/path";

/**
 * Restores a logged-in user's saved language preference (D1 `locale_pref`)
 * on sign-in — e.g. logging in on a new device/browser that doesn't have
 * the sticky `locale_pref` cookie yet. Runs once per sign-in (guarded by
 * uid, not by locale, so a manual language switch afterwards doesn't
 * re-trigger it); if this is the user's very first login, the GET call
 * itself records the current locale as their preference, so there's
 * nothing to redirect.
 */
export function LocalePrefSync({ locale }: { locale: Locale }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const syncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedUid.current === user.uid) return;
    syncedUid.current = user.uid;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetchWithAuth(user, `/api/v1/me?locale=${locale}`);
        if (!response.ok || cancelled) return;
        const body = (await response.json()) as {
          user?: { localePref?: string };
        };
        const preferred = body.user?.localePref;
        if (preferred && isLocale(preferred) && preferred !== locale) {
          router.replace(swapLocalePath(pathname || `/${locale}`, preferred));
        }
      } catch {
        // Best-effort sync — staying on the current locale is a safe fallback.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, locale, pathname, router]);

  return null;
}
