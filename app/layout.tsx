import type { Metadata } from "next";
import { Heebo, Rubik, Alex_Brush } from "next/font/google";
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

export const metadata: Metadata = {
  title: "The Frame by Barzilay — למדו את הרוטינה",
  description:
    "מדריכי ריקוד יוקרתיים. למדו רוטינות וקומבינציות בודדות, פריים אחרי פריים.",
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
        {children}
      </body>
    </html>
  );
}
