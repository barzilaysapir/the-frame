"use client";

import { useState } from "react";
import { Check, Copy, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface BitPaymentCardLabels {
  title: string;
  amountLabel: string;
  copyLabel: string;
  copiedLabel: string;
  step1: string;
  step2: string;
  step3: string;
}

interface BitPaymentCardProps {
  amountIls: number;
  phone: string;
  labels: BitPaymentCardLabels;
}

/**
 * Phase-1 "pay with Bit" instructions. Bit has no public deep-link/API for
 * a non-merchant-integrated site to trigger a payment (that only exists
 * via a registered payment aggregator, the automated-gateway path
 * deliberately deferred for now — see lib/bit-payment.ts) — so this is a
 * deliberate, real UI for the manual "here's the number, send it
 * yourself" flow, not a degraded placeholder state.
 */
export function BitPaymentCard({ amountIls, phone, labels }: BitPaymentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[BitPaymentCard] clipboard write failed:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-frame-border bg-gradient-to-br from-frame-bg to-frame-panel">
      <div className="flex items-center gap-3 border-b border-frame-border bg-frame-bg/60 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neon-cta text-frame-bg">
          <Smartphone className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{labels.title}</p>
          <p className="text-xs text-frame-muted">
            {labels.amountLabel}: <span className="font-semibold text-frame-cyan">₪{amountIls}</span>
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-frame-border bg-frame-bg px-4 py-3">
          <span dir="ltr" className="font-display text-xl font-black tracking-wide text-white">
            {phone}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            className={cn(
              "px-3 py-1.5 text-xs",
              copied && "border-frame-cyan text-frame-cyan",
            )}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? labels.copiedLabel : labels.copyLabel}
          </Button>
        </div>

        <ol className="mt-4 space-y-2 text-sm text-frame-silver">
          {[labels.step1, labels.step2, labels.step3].map((step, index) => (
            <li key={index} className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-frame-border text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
