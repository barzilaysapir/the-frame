import Link from "next/link";
import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import type { InstructorRecord } from "@/lib/instructors";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { localizeInstructor } from "@/lib/i18n/localize";
import { routinesFilterHref } from "@/lib/routines";

interface InstructorCardProps {
  instructor: InstructorRecord;
  locale: Locale;
  routineCount?: number;
  labels: {
    routineOne: string;
    routineMany: string;
    instagramAria: string;
    tutorialsAria: string;
  };
}

export function InstructorCard({
  instructor,
  locale,
  routineCount,
  labels,
}: InstructorCardProps) {
  const localized = localizeInstructor(locale, instructor);

  return (
    <article className="group relative rounded-2xl border border-frame-border bg-frame-panel p-6 transition-colors hover:border-frame-cyan/60">
      <Link
        href={routinesFilterHref({ instructor: instructor.slug, locale })}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={formatMessage(labels.tutorialsAria, {
          name: localized.name,
        })}
      />

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <InstructorAvatar
            name={localized.name}
            src={instructor.avatar}
            className="h-12 w-12"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-white">
                {localized.name}
              </h3>
              <a
                href={instructor.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-20 rounded-sm text-frame-cyan transition-colors hover:text-white"
                aria-label={formatMessage(labels.instagramAria, {
                  name: localized.name,
                })}
              >
                <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
            <p className="text-sm text-frame-silver">{localized.role}</p>
          </div>
        </div>

        {typeof routineCount === "number" && routineCount > 0 ? (
          <p className="mt-5 border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
            {routineCount === 1
              ? labels.routineOne
              : formatMessage(labels.routineMany, { count: routineCount })}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default InstructorCard;
