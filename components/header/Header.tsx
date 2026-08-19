"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderAuthActions } from "@/components/header/HeaderAuthActions";
import { MobileBottomNav } from "@/components/header/MobileBottomNav";
import { NAV_ICONS } from "@/components/header/nav-icons";
import { UserMenu } from "@/components/header/UserMenu";
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { getNavLinks, isNavPathActive } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale: Locale;
  labels: Dictionary["nav"];
  profileLabel: string;
}

export function Header({ locale, labels, profileLabel }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { user, signOutUser } = useAuth();
  const isAuthenticated = Boolean(user);

  const navLinks = getNavLinks(locale, labels);

  const handleSignOut = async () => {
    await signOutUser();
    router.push(localePath(locale));
  };

  const accountName =
    user?.displayName ||
    user?.email ||
    user?.phoneNumber ||
    (locale === "he" ? "חשבון" : "Account");

  const userMenu = (
    <UserMenu
      locale={locale}
      labels={{
        account: labels.account,
        favorites: labels.favorites,
        profile: profileLabel,
        signOut: labels.signOut,
        language: labels.language,
      }}
      accountName={accountName}
      photoURL={user?.photoURL}
      onSignOut={handleSignOut}
    />
  );

  return (
    <>
      {/*
       * MobileBottomNav is deliberately NOT nested inside <header>: its
       * `backdrop-blur-md` creates a new containing block for `position:
       * fixed` descendants in Chrome, which pins them to the header's own
       * (tiny) box instead of the viewport. Keeping it as a sibling avoids
       * that footgun entirely.
       */}
      <header className="sticky top-0 z-50 border-b border-frame-border/80 bg-frame-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale)}
            dir={locale === "he" ? "rtl" : "ltr"}
            className="group flex min-w-0 items-center gap-2.5"
            aria-label="The Frame by Barzilay"
          >
            <Image
              src="/logos/logo-mark.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 opacity-90 transition-opacity group-hover:opacity-100"
              priority
            />
            <span className="flex flex-col leading-none">
              <Image
                src="/logos/logo-wordmark-light-silver.png"
                alt="The Frame"
                width={240}
                height={57}
                className="h-6 w-auto"
                priority
              />
              <span className="mt-1 text-[9px] font-medium uppercase tracking-widest2 text-frame-muted">
                by Barzilay
              </span>
            </span>
          </Link>

          <TooltipProvider>
            <nav className="hidden items-center gap-5 lg:flex">
              {navLinks.map((link) => {
                const active = isNavPathActive(pathname, locale, link.matchPaths);
                const Icon = NAV_ICONS[link.id];
                return (
                  <Tooltip key={link.id} label={link.label}>
                    <Link
                      href={link.href}
                      aria-label={link.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                        active
                          ? "bg-frame-cyan/10 text-frame-cyan"
                          : "text-frame-silver hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </Link>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Desktop auth / language */}
            <div className="hidden items-center gap-4 lg:flex">
              {!isAuthenticated ? (
                <LanguageSwitcher locale={locale} label={labels.language} />
              ) : null}
              {isAuthenticated ? userMenu : (
                <HeaderAuthActions locale={locale} labels={labels} />
              )}
            </div>
          </TooltipProvider>

          {/* Mobile: avatar menu when signed in; language + logo-mark login when signed out. */}
          <div className="flex shrink-0 items-center gap-3 lg:hidden">
            {isAuthenticated ? (
              userMenu
            ) : (
              <>
                <LanguageSwitcher locale={locale} label={labels.language} />
                <Link
                  href={localePath(locale, "/login")}
                  aria-label={labels.login}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-frame-silver transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-cyan"
                >
                  <LogIn className="h-5 w-5" aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileBottomNav locale={locale} labels={labels} />
    </>
  );
}
