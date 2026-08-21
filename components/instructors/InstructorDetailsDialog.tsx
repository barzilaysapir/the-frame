"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Instagram, X } from "lucide-react";
import type { ReactNode } from "react";
import { InstructorAvatar } from "@/components/instructors/InstructorAvatar";
import { InstructorContentCounts } from "@/components/instructors/InstructorContentCounts";

interface InstructorDetailsDialogProps {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  instagramUrl: string;
  instagramAriaLabel: string;
  routineCount: number;
  courseCount: number;
  libraryHref: string;
  libraryAriaLabel: string;
  trigger: ReactNode;
  closeAriaLabel: string;
  countLabels: {
    routineOne: string;
    routineMany: string;
    courseOne: string;
    courseMany: string;
  };
}

export function InstructorDetailsDialog({
  name,
  role,
  bio,
  avatar,
  instagramUrl,
  instagramAriaLabel,
  routineCount,
  courseCount,
  libraryHref,
  libraryAriaLabel,
  trigger,
  closeAriaLabel,
  countLabels,
}: InstructorDetailsDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-frame-border bg-frame-panel p-6 data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide">
          <Dialog.Title className="sr-only">{name}</Dialog.Title>
          <div className="flex flex-col items-center text-center">
            {avatar ? (
              <InstructorAvatar name={name} src={avatar} className="h-28 w-28" sizes="112px" />
            ) : (
              <InstructorAvatar name={name} className="h-28 w-28 text-2xl" />
            )}
            <h2 className="mt-4 font-display text-2xl font-black text-white">{name}</h2>
            <p className="mt-1 text-sm text-frame-silver">{role}</p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-frame-border bg-white/5 text-frame-cyan transition-colors hover:border-frame-cyan hover:bg-frame-cyan/10 hover:text-white"
              aria-label={instagramAriaLabel}
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          {bio ? (
            <p className="mt-5 text-sm leading-relaxed text-frame-silver">{bio}</p>
          ) : null}
          <InstructorContentCounts
            routineCount={routineCount}
            courseCount={courseCount}
            href={libraryHref}
            ariaLabel={libraryAriaLabel}
            labels={countLabels}
          />
          <Dialog.Close
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-frame-border bg-frame-bg text-white transition-colors hover:border-frame-cyan"
            aria-label={closeAriaLabel}
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
