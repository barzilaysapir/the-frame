"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderAuthActions } from "@/components/header/HeaderAuthActions";
import { MobileMenuAuthActions } from "@/components/header/MobileMenuAuthActions";
import { UserMenu } from "@/components/header/UserMenu";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { getNavLinks } from "@/lib/nav-links";

interface HeaderProps {
  locale: Locale;
  labels: Dictionary["nav"];
  settingsLabel: string;
}

export function Header({ locale, labels, settingsLabel }: HeaderProps) {
  const menuId = useId();
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const isAuthenticated = Boolean(user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = getNavLinks(locale, labels);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleSignOut = async () => {
    await signOutUser();
    closeMenu();
    router.push(localePath(locale));
  };

  const accountName =
    user?.displayName ||
    user?.email ||
    user?.phoneNumber ||
    (locale === "he" ? "חשבון" : "Account");

  return (
    <header className="sticky top-0 z-50 border-b border-frame-border/80 bg-frame-bg/85 backdrop-blur-md">
      <div className="relative z-[60] mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={localePath(locale)}
          dir={locale === "he" ? "rtl" : "ltr"}
          onClick={closeMenu}
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

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {!isAuthenticated ? (
          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher locale={locale} label={labels.language} />
            <HeaderAuthActions locale={locale} labels={labels} />
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <UserMenu
              locale={locale}
              labels={{
                account: labels.account,
                favorites: labels.favorites,
                settings: settingsLabel,
                signOut: labels.signOut,
                language: labels.language,
              }}
              accountName={accountName}
              photoURL={user?.photoURL}
              onSignOut={handleSignOut}
            />
          ) : null}

          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white touch-manipulation lg:hidden"
            aria-label={isMenuOpen ? labels.closeMenu : labels.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls={isMenuOpen ? menuId : undefined}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div id={menuId} className="fixed inset-x-0 bottom-0 top-16 z-[55] lg:hidden">
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={closeMenu}
            className="absolute inset-0 bg-black/50 touch-manipulation"
          />
          <nav className="relative border-b border-frame-border/80 bg-frame-bg shadow-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-base font-medium text-frame-silver transition-colors hover:bg-frame-panel hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 px-3">
                <LanguageSwitcher locale={locale} label={labels.language} />
              </div>
              {!isAuthenticated ? (
                <div className="mt-2 flex flex-col gap-2 border-t border-frame-border/80 pt-4">
                  <MobileMenuAuthActions
                    locale={locale}
                    labels={labels}
                    onCloseMenu={closeMenu}
                  />
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
