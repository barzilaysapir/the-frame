import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.account.metaTitle };
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
