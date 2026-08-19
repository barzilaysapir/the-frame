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
  footer: Dictionary["footer"];
}

const SOCIAL_ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  youtube: Youtube,
};

export function Footer({ locale, footer }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-frame-border/80 bg-frame-bg">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 text-center sm:flex-row sm:justify-between sm:text-start sm:px-6 lg:px-8">
        <Link
          href={localePath(locale)}
          dir={locale === "he" ? "rtl" : "ltr"}
          className="flex items-center gap-2"
          aria-label="The Frame by Barzilay"
        >
          <Image
            src="/logos/logo-mark.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 opacity-80"
          />
          <Image
            src="/logos/logo-wordmark-light-silver.png"
            alt="The Frame"
            width={240}
            height={57}
            className="h-6 w-auto"
          />
        </Link>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          <p className="text-xs text-frame-muted">
            © {year} The Frame by Barzilay. {footer.rights}
          </p>
          <div className="flex items-center gap-x-6">
            <Link
              href={localePath(locale, "/terms")}
              className="text-xs text-frame-muted transition-colors hover:text-white"
            >
              {footer.terms}
            </Link>
            <Link
              href={localePath(locale, "/contact")}
              className="text-xs text-frame-muted transition-colors hover:text-white"
            >
              {footer.contact}
            </Link>
          </div>
        </div>

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
      </div>
    </footer>
  );
}
