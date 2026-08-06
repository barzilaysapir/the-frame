import type { Metadata } from "next";
import { Heebo, Rubik, Alex_Brush } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

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

const SITE_TITLE = "The Frame by Barzilay — למדו את הקומבינציה";
const SITE_DESCRIPTION =
  "מדריכי ריקוד יוקרתיים. למדו קומבינציות בודדות, פריים אחרי פריים.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | The Frame by Barzilay",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "The Frame by Barzilay",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`dark ${heebo.variable} ${rubik.variable} ${logoScript.variable}`}
    >
      <body className="min-h-screen bg-frame-bg font-sans antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
