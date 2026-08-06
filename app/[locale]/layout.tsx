import type { Metadata } from "next";
import { Heebo, Rubik, Alex_Brush } from "next/font/google";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  isLocale,
  localeDirections,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";
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

  return {
    metadataBase: new URL(SITE_URL),
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
    },
    twitter: {
      card: "summary",
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
    },
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

  return (
    <html
      lang={locale}
      dir={localeDirections[locale]}
      className={`dark ${heebo.variable} ${rubik.variable} ${logoScript.variable}`}
    >
      <body className="min-h-screen bg-frame-bg font-sans antialiased">
        <AuthProvider>
          <Header locale={locale} labels={dict.nav} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
