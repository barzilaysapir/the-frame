"use client";

import type { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

/**
 * Hover/focus label for icon-only controls. Prefer wrapping a cluster of
 * tooltips in one `TooltipProvider` (native `title` is slow and unstyled).
 */
export function Tooltip({
  label,
  children,
  side = "bottom",
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-[80] rounded-md border border-frame-border bg-frame-panel px-2.5 py-1.5 text-xs font-medium text-white shadow-lg",
            className,
          )}
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
