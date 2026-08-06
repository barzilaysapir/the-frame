"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const NAV_LINKS = [
  { label: "קומבינציות", href: "/routines" },
  { label: "מדריכים", href: "/instructors" },
  { label: "אודות", href: "/about" },
];

export function Header() {
  const menuId = useId();
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const isAuthenticated = Boolean(user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    router.push("/");
  };

  const accountInitial =
    user?.displayName?.[0] ?? user?.phoneNumber?.slice(-2) ?? "ב";

  return (
    <header className="sticky top-0 z-50 border-b border-frame-border/80 bg-frame-bg/85 backdrop-blur-md">
      <div className="relative z-[60] mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          dir="ltr"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-2.5"
          aria-label="The Frame by Barzilay — לדף הבית"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 opacity-90 transition-opacity group-hover:opacity-100"
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="font-logo text-3xl leading-none text-white">
              The Frame
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest2 text-frame-muted">
              by Barzilay
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
              >
                התנתקות
              </button>
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-frame-border bg-frame-panel text-sm font-semibold text-white transition-colors hover:border-white"
              >
                {accountInitial}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
              >
                התחברות
              </Link>
              <Link
                href="/routines"
                className="group inline-flex items-center gap-1.5 rounded-full bg-neon-cta px-4 py-2 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
              >
                קבלו גישה
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white touch-manipulation lg:hidden"
          aria-label={isMenuOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? menuId : undefined}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div id={menuId} className="fixed inset-x-0 bottom-0 top-16 z-[55] lg:hidden">
          <button
            type="button"
            aria-label="סגור תפריט"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/50 touch-manipulation"
          />
          <nav className="relative border-b border-frame-border/80 bg-frame-bg shadow-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-base font-medium text-frame-silver transition-colors hover:bg-frame-panel hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-frame-border/80 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-3 text-center text-base font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
                    >
                      האזור האישי
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="rounded-full bg-neon-cta px-3 py-3 text-center text-base font-semibold text-frame-bg touch-manipulation hover:brightness-110"
                    >
                      התנתקות
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-3 text-center text-base font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
                    >
                      התחברות
                    </Link>
                    <Link
                      href="/routines"
                      onClick={closeMenu}
                      className="rounded-full bg-neon-cta px-3 py-3 text-center text-base font-semibold text-frame-bg hover:brightness-110"
                    >
                      קבלו גישה
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
