"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { FrameMark } from "./FrameMark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Explore Routines", href: "/routines" },
  { label: "Instructors", href: "/instructors" },
  { label: "About", href: "/about" },
];

interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-frame-border/80 bg-frame-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="The Frame by Barzilay — home"
        >
          <FrameMark className="h-8 w-8 text-white transition-colors group-hover:text-frame-gold" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              The Frame
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest2 text-frame-muted">
              by Barzilay
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
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

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <Link
              href="/account"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-frame-border bg-frame-panel text-sm font-semibold text-white transition-colors hover:border-frame-gold"
            >
              B
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-frame-silver transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/get-access"
                className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-frame-bg transition-colors hover:bg-frame-gold"
              >
                Get Access
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          "overflow-hidden border-t border-frame-border/80 bg-frame-bg transition-[max-height] duration-300 ease-in-out md:hidden",
          isMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-frame-silver transition-colors hover:bg-frame-panel hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-frame-border/80 pt-4">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-frame-silver hover:bg-frame-panel hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/get-access"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-white px-3 py-2.5 text-center text-sm font-semibold text-frame-bg hover:bg-frame-gold"
            >
              Get Access
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
