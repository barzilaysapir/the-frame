import Link from "next/link";
import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/InstructorAvatar";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/get-dictionary";
import { routinesFilterHref } from "@/lib/routines";
import type { CatalogInstructor } from "@/lib/server/catalog/types";

interface InstructorCardProps {
  instructor: CatalogInstructor;
  locale: Locale;
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
  labels,
}: InstructorCardProps) {
  return (
    <article className="group relative rounded-2xl border border-frame-border bg-frame-panel p-6 transition-colors hover:border-frame-cyan/60">
      <Link
        href={routinesFilterHref({ instructor: instructor.slug, locale })}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={formatMessage(labels.tutorialsAria, {
          name: instructor.name,
        })}
      />

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <InstructorAvatar
            name={instructor.name}
            src={instructor.avatar}
            className="h-12 w-12"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-white">
                {instructor.name}
              </h3>
              <a
                href={instructor.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-20 rounded-sm text-frame-cyan transition-colors hover:text-white"
                aria-label={formatMessage(labels.instagramAria, {
                  name: instructor.name,
                })}
              >
                <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
            <p className="text-sm text-frame-silver">{instructor.role}</p>
          </div>
        </div>

        {instructor.routineCount > 0 ? (
          <p className="mt-5 border-t border-frame-border pt-4 text-sm font-semibold text-frame-cyan transition-colors group-hover:text-white">
            {instructor.routineCount === 1
              ? labels.routineOne
              : formatMessage(labels.routineMany, {
                  count: instructor.routineCount,
                })}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default InstructorCard;
