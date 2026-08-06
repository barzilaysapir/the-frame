import he from "@/mocks/content/he.json";
import en from "@/mocks/content/en.json";
import type { Locale } from "@/lib/i18n/config";

export type MockContent = typeof he;

const mockContent: Record<Locale, MockContent> = {
  he,
  en,
};

/**
 * Locale-specific **mock** catalog copy (not UI chrome).
 * Temporary until the server/CMS returns localized catalog fields per request.
 */
export function getMockContent(locale: Locale): MockContent {
  return mockContent[locale];
}
