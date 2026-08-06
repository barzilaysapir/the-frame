import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type he from "@/dictionaries/he.json";

export type Dictionary = typeof he;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  he: () => import("@/dictionaries/he.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  if (!isLocale(locale)) notFound();
  return dictionaries[locale]();
}

/** Replace `{name}`-style placeholders in a dictionary string. */
export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
