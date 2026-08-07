"use client";

interface CheckoutSubscriptionTeaserProps {
  text: string;
}

export function CheckoutSubscriptionTeaser({
  text,
}: CheckoutSubscriptionTeaserProps) {
  if (!text) return null;

  return (
    <p className="mt-4 rounded-xl border border-dashed border-frame-border bg-frame-bg/60 px-4 py-3 text-sm text-frame-silver">
      {text}
    </p>
  );
}

export default CheckoutSubscriptionTeaser;
