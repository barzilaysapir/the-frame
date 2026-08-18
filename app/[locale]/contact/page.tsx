import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { SOCIAL_LINKS } from "@/lib/social";

const CONTACT_EMAIL = "theframe@bybarzilay.com";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const { title, body, emailLabel, instagramLabel } = dict.contact;
  const instagram = SOCIAL_LINKS.find((link) => link.platform === "instagram");

  return (
    <main className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-frame-silver">{body}</p>

        <dl className="mt-8 space-y-4">
          <div>
            <dt className="text-xs font-medium text-frame-muted">{emailLabel}</dt>
            <dd className="mt-1">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-frame-cyan underline"
                dir="ltr"
              >
                {CONTACT_EMAIL}
              </a>
            </dd>
          </div>
          {instagram ? (
            <div>
              <dt className="text-xs font-medium text-frame-muted">{instagramLabel}</dt>
              <dd className="mt-1">
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-frame-cyan underline"
                  dir="ltr"
                >
                  @bybarzilay
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </main>
  );
}
