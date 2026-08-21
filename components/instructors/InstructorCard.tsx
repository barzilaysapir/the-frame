import { InstructorCardHeader } from "@/components/instructors/InstructorCardHeader";
import { InstructorContentCounts } from "@/components/instructors/InstructorContentCounts";
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
    detailsAria: string;
    detailsClose: string;
  };
}

export function InstructorCard({
  instructor,
  locale,
  labels,
}: InstructorCardProps) {
  const libraryHref = routinesFilterHref({ instructor: instructor.slug, locale });
  const libraryAriaLabel = formatMessage(labels.tutorialsAria, {
    name: instructor.name,
  });
  const countLabels = {
    routineOne: labels.routineOne,
    routineMany: labels.routineMany,
    courseOne: labels.courseOne,
    courseMany: labels.courseMany,
  };

  return (
    <Panel as="article" className="p-6">
      <InstructorCardHeader
        name={instructor.name}
        role={instructor.role}
        bio={instructor.bio}
        avatar={instructor.avatar}
        instagramUrl={instructor.instagramUrl}
        instagramAriaLabel={formatMessage(labels.instagramAria, {
          name: instructor.name,
        })}
        detailsAriaLabel={formatMessage(labels.detailsAria, {
          name: instructor.name,
        })}
        detailsCloseAriaLabel={labels.detailsClose}
        routineCount={instructor.routineCount}
        courseCount={instructor.courseCount}
        libraryHref={libraryHref}
        libraryAriaLabel={libraryAriaLabel}
        countLabels={countLabels}
      />

      <InstructorContentCounts
        routineCount={instructor.routineCount}
        courseCount={instructor.courseCount}
        href={libraryHref}
        ariaLabel={libraryAriaLabel}
        labels={countLabels}
      />
    </Panel>
  );
}
