"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, Heart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/account/UserAvatar";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import { locales, localeDirections, localeNames, type Locale } from "@/lib/i18n/config";
import { localePath, swapLocalePath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

interface UserMenuLabels {
  account: string;
  favorites: string;
  profile: string;
  signOut: string;
  language: string;
}

interface UserMenuProps {
  locale: Locale;
  labels: UserMenuLabels;
  accountName: string;
  photoURL?: string | null;
  onSignOut: () => void;
  /** "top" for triggers anchored at the bottom of the screen (mobile tab bar). */
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  avatarClassName?: string;
}

const itemClassName =
  "flex items-center gap-2.5 px-4 py-2.5 text-start text-sm font-medium text-frame-silver outline-none transition-colors hover:bg-white/5 hover:text-white data-[highlighted]:bg-white/5 data-[highlighted]:text-white";

/**
 * Avatar-triggered dropdown for signed-in users: collection, favorites,
 * profile, language, sign out. Used in the header (opens downward).
 */
export function UserMenu({
  locale,
  labels,
  accountName,
  photoURL,
  onSignOut,
  side = "bottom",
  align = "end",
  avatarClassName = "h-9 w-9 text-sm",
}: UserMenuProps) {
  const pathname = usePathname() || `/${locale}`;
  const { user } = useAuth();

  const handleLocaleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale || !user) return;
    // Fire-and-forget: persist the explicit choice to D1 so it's restored
    // on other devices/sessions too. Navigation isn't blocked on this.
    void fetchWithAuth(user, "/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify({ localePref: nextLocale }),
    }).catch(() => {});
  };

  return (
    <DropdownMenu.Root modal={false} dir={localeDirections[locale]}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={labels.account}
          className="rounded-full transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-cyan"
        >
          <UserAvatar
            name={accountName}
            photoURL={photoURL}
            className={avatarClassName}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={10}
          className="z-[70] flex w-56 flex-col overflow-hidden rounded-xl border border-frame-border bg-frame-panel py-1.5 shadow-xl"
        >
          <DropdownMenu.Item asChild>
            <Link href={localePath(locale, "/account")} className={itemClassName}>
              <User className="h-4 w-4 shrink-0" />
              {labels.account}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link href={localePath(locale, "/account/favorites")} className={itemClassName}>
              <Heart className="h-4 w-4 shrink-0" />
              {labels.favorites}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link href={localePath(locale, "/account/profile")} className={itemClassName}>
              <Settings className="h-4 w-4 shrink-0" />
              {labels.profile}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1.5 h-px bg-frame-border" />

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-frame-muted">
              {labels.language}
            </span>
            <div className="flex items-center gap-1">
              {locales.map((item) => {
                const active = item === locale;
                return (
                  <DropdownMenu.Item key={item} asChild>
                    <Link
                      href={swapLocalePath(pathname, item)}
                      hrefLang={item}
                      onClick={() => handleLocaleSwitch(item)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold outline-none transition-colors data-[highlighted]:text-white",
                        active
                          ? "bg-white/10 text-white"
                          : "text-frame-muted hover:text-white",
                      )}
                    >
                      {localeNames[item]}
                    </Link>
                  </DropdownMenu.Item>
                );
              })}
            </div>
          </div>

          <DropdownMenu.Separator className="my-1.5 h-px bg-frame-border" />

          <DropdownMenu.Item
            onSelect={onSignOut}
            className={cn(itemClassName, "cursor-pointer")}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {labels.signOut}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
