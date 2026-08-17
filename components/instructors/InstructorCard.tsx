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
    avatarEnlargeAria: string;
    avatarLightboxClose: string;
  };
}

export function InstructorCard({
  instructor,
  locale,
  labels,
}: InstructorCardProps) {
  return (
    <Panel as="article" className="p-6">
      <InstructorCardHeader
        name={instructor.name}
        role={instructor.role}
        avatar={instructor.avatar}
        instagramUrl={instructor.instagramUrl}
        instagramAriaLabel={formatMessage(labels.instagramAria, {
          name: instructor.name,
        })}
        avatarEnlargeAriaLabel={formatMessage(labels.avatarEnlargeAria, {
          name: instructor.name,
        })}
        avatarLightboxCloseAriaLabel={labels.avatarLightboxClose}
      />

      <InstructorContentCounts
        routineCount={instructor.routineCount}
        courseCount={instructor.courseCount}
        href={routinesFilterHref({ instructor: instructor.slug, locale })}
        ariaLabel={formatMessage(labels.tutorialsAria, {
          name: instructor.name,
        })}
        labels={labels}
      />
    </Panel>
  );
}
