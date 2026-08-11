import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube } from "lucide-react";
import type { ComponentType } from "react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { SOCIAL_LINKS, SOCIAL_PLATFORM_NAMES, type SocialPlatform } from "@/lib/social";
import { formatMessage, type Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

interface FooterProps {
  locale: Locale;
  labels: Dictionary["nav"];
  footer: Dictionary["footer"];
}

const SOCIAL_ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  youtube: Youtube,
};

export function Footer({ locale, labels, footer }: FooterProps) {
  const year = new Date().getFullYear();

  const navLinks = [
    { label: labels.tutorials, href: localePath(locale, "/routines") },
    { label: labels.teachers, href: localePath(locale, "/instructors") },
    { label: labels.about, href: localePath(locale, "/about") },
  ];

  return (
    <footer className="border-t border-frame-border/80 bg-frame-bg">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-start sm:px-6 lg:px-8">
        <Link
          href={localePath(locale)}
          dir={locale === "he" ? "rtl" : "ltr"}
          className="flex items-center gap-2"
          aria-label="The Frame by Barzilay"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 opacity-80"
          />
          <span className="font-logo text-xl leading-none text-white">
            The Frame
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-frame-silver transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {SOCIAL_LINKS.length > 0 ? (
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ platform, url }) => {
              const Icon = SOCIAL_ICONS[platform];
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={formatMessage(footer.socialAria, {
                    platform: SOCIAL_PLATFORM_NAMES[platform],
                  })}
                  className="text-frame-silver transition-colors hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        ) : null}

        <p className="text-xs text-frame-muted">
          © {year} The Frame by Barzilay. {footer.rights}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
