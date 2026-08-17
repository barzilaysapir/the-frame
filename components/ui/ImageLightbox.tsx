"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  trigger: ReactNode;
  triggerAriaLabel: string;
  closeAriaLabel: string;
}

/** Click a trigger (e.g. an avatar) to view the same image enlarged, in a modal. */
export function ImageLightbox({
  src,
  alt,
  trigger,
  triggerAriaLabel,
  closeAriaLabel,
}: ImageLightboxProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild aria-label={triggerAriaLabel}>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[80vh] w-[80vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <Image src={src} alt={alt} fill sizes="80vw" className="object-contain" />
          </div>
          <Dialog.Close
            className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-frame-border bg-frame-panel text-white transition-colors hover:border-frame-cyan"
            aria-label={closeAriaLabel}
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
