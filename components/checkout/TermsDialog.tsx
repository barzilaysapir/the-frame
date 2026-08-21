"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { TermsContent } from "@/components/legal/TermsContent";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface TermsDialogProps {
  trigger: string;
  dict: Dictionary["terms"];
  closeLabel: string;
}

/** Opens the terms-of-service copy in a modal, so agreeing to it at checkout doesn't require leaving the page. */
export function TermsDialog({ trigger, dict, closeLabel }: TermsDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-frame-cyan underline">
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-frame-border bg-frame-panel p-6 sm:p-8">
          <Dialog.Title className="sr-only">{dict.title}</Dialog.Title>
          <TermsContent dict={dict} headingLevel="h2" />
          <Dialog.Close
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-frame-border bg-frame-bg text-white transition-colors hover:border-frame-cyan"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
