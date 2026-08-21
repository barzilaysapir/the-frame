"use client";

import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/instructors/InstructorAvatar";
import { InstructorDetailsDialog } from "@/components/instructors/InstructorDetailsDialog";

interface InstructorCardHeaderProps {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  instagramUrl: string;
  instagramAriaLabel: string;
  detailsAriaLabel: string;
  detailsCloseAriaLabel: string;
  routineCount: number;
  courseCount: number;
  libraryHref: string;
  libraryAriaLabel: string;
  countLabels: {
    routineOne: string;
    routineMany: string;
    courseOne: string;
    courseMany: string;
  };
}

export function InstructorCardHeader({
  name,
  role,
  bio,
  avatar,
  instagramUrl,
  instagramAriaLabel,
  detailsAriaLabel,
  detailsCloseAriaLabel,
  routineCount,
  courseCount,
  libraryHref,
  libraryAriaLabel,
  countLabels,
}: InstructorCardHeaderProps) {
  const avatarElement = <InstructorAvatar name={name} src={avatar} className="h-12 w-12" />;

  return (
    <div className="flex items-center gap-3">
      <InstructorDetailsDialog
        name={name}
        role={role}
        bio={bio}
        avatar={avatar}
        instagramUrl={instagramUrl}
        instagramAriaLabel={instagramAriaLabel}
        routineCount={routineCount}
        courseCount={courseCount}
        libraryHref={libraryHref}
        libraryAriaLabel={libraryAriaLabel}
        closeAriaLabel={detailsCloseAriaLabel}
        countLabels={countLabels}
        trigger={
          <button
            type="button"
            aria-label={detailsAriaLabel}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-start transition-opacity hover:opacity-80"
          >
            {avatarElement}
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-black text-white">{name}</h3>
              <p className="text-sm text-frame-silver">{role}</p>
            </div>
          </button>
        }
      />
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-frame-border bg-white/5 text-frame-cyan transition-colors hover:border-frame-cyan hover:bg-frame-cyan/10 hover:text-white"
        aria-label={instagramAriaLabel}
      >
        <Instagram className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}
