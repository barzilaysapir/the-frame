import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Frame by Barzilay — Learn the Routine",
  description:
    "High-end dance tutorials. Learn single routines and combinations frame by frame.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-frame-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
