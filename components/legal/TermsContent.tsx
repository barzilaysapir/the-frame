import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface TermsContentProps {
  dict: Dictionary["terms"];
  /** "h1" on the full /terms page; "h2" inside TermsDialog, which supplies its own Dialog.Title for the section headings to nest under. */
  headingLevel?: "h1" | "h2";
}

/** The terms-of-service copy itself, shared between the full `/terms` page and `TermsDialog`. */
export function TermsContent({ dict, headingLevel = "h1" }: TermsContentProps) {
  const { title, updated, intro, sections } = dict;
  const Heading = headingLevel;
  const SectionHeading = headingLevel === "h1" ? "h2" : "h3";

  return (
    <>
      <Heading className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
        {title}
      </Heading>
      <p className="mt-2 text-xs text-frame-muted">{updated}</p>
      <p className="mt-6 text-frame-silver">{intro}</p>

      <div className="mt-10 space-y-8">
        {Object.values(sections).map((section) => (
          <section key={section.title}>
            <SectionHeading className="font-display text-xl font-black text-white">
              {section.title}
            </SectionHeading>
            <p className="mt-2 text-frame-silver">{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
