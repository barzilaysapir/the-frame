import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import he from "@/dictionaries/he.json";
import en from "@/dictionaries/en.json";

export type Dictionary = typeof he;

const dictionaries: Record<Locale, Dictionary> = {
  he,
  en,
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  if (!isLocale(locale)) notFound();
  return dictionaries[locale];
}

/** Sync dictionary access for Client Components. */
export function getDictionarySync(locale: Locale): Dictionary {
  return dictionaries[locale];
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
