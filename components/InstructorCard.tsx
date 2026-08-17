import Link from "next/link";
import { InstructorCardHeader } from "@/components/InstructorCardHeader";
import { InstructorContentCounts } from "@/components/InstructorContentCounts";
import { Panel } from "@/components/ui/Panel";
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
    courseOne: string;
    courseMany: string;
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
    <Panel as="article" variant="interactive" className="group relative p-6">
      <Link
        href={routinesFilterHref({ instructor: instructor.slug, locale })}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={formatMessage(labels.tutorialsAria, {
          name: instructor.name,
        })}
      />

      <div className="relative z-10 pointer-events-none">
        <InstructorCardHeader
          name={instructor.name}
          role={instructor.role}
          avatar={instructor.avatar}
          instagramUrl={instructor.instagramUrl}
          instagramAriaLabel={formatMessage(labels.instagramAria, {
            name: instructor.name,
          })}
        />

        <InstructorContentCounts
          routineCount={instructor.routineCount}
          courseCount={instructor.courseCount}
          labels={labels}
        />
      </div>
    </Panel>
  );
}
