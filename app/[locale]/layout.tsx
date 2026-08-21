import type { Metadata } from "next";
import { Heebo, Rubik, Alex_Brush } from "next/font/google";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteAccessGate } from "@/components/auth/SiteAccessGate";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import { LocalePrefSync } from "@/components/LocalePrefSync";
import { ThemeFavicon } from "@/components/ThemeFavicon";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  isLocale,
  localeDirections,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { resolveShareOrigin } from "@/lib/server/share-origin";
import { isSiteAccessRestricted } from "@/lib/server/site-access";
import {
  DEFAULT_SHARE_IMAGE,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_WIDTH,
  absoluteAssetUrl,
  shareImageFields,
} from "@/lib/share-metadata";
import { FAVICON_DARK, FAVICON_LIGHT } from "@/lib/favicon";
import "../globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
});

const logoScript = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam;
  const dict = await getDictionary(locale);
  const origin = await resolveShareOrigin();

  return {
    metadataBase: new URL(origin),
    title: {
      default: dict.meta.siteTitle,
      template: "%s | The Frame by Barzilay",
    },
    description: dict.meta.siteDescription,
    openGraph: {
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      siteName: "The Frame by Barzilay",
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
      images: shareImageFields({
        url: DEFAULT_SHARE_IMAGE,
        alt: "The Frame by Barzilay",
        width: DEFAULT_SHARE_IMAGE_WIDTH,
        height: DEFAULT_SHARE_IMAGE_HEIGHT,
        origin,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      images: [absoluteAssetUrl(DEFAULT_SHARE_IMAGE, origin)],
    },
    icons: {
      icon: [
        {
          url: FAVICON_DARK,
          type: "image/png",
          sizes: "32x32",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: FAVICON_LIGHT,
          type: "image/png",
          sizes: "32x32",
          media: "(prefers-color-scheme: light)",
        },
      ],
    },
    themeColor: "#0F0F11",
    alternates: {
      languages: {
        he: "/he",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = await getDictionary(locale);
  const siteAccessRestricted = await isSiteAccessRestricted();

  const shell = (
    <>
      <LocalePrefSync locale={locale} />
      <ThemeFavicon />
      <FavoritesProvider locale={locale}>
        <Header
          locale={locale}
          labels={dict.nav}
          profileLabel={dict.account.nav.profile}
        />
        <div className="flex-1">{children}</div>
        <Footer locale={locale} footer={dict.footer} />
      </FavoritesProvider>
    </>
  );

  return (
    <html
      lang={locale}
      dir={localeDirections[locale]}
      className={`dark ${heebo.variable} ${rubik.variable} ${logoScript.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-frame-bg pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans antialiased lg:pb-0">
        <AuthProvider>
          {siteAccessRestricted ? (
            <SiteAccessGate
              labels={dict.siteAccess}
              loginErrors={dict.login.errors}
            >
              {shell}
            </SiteAccessGate>
          ) : (
            shell
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
