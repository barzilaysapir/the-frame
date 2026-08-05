interface FrameMarkProps {
  className?: string;
}

/**
 * Brand glyph: an open corner-frame silhouette (viewfinder) around a
 * dancer's silhouette, echoing "The Frame" name and video-tutorial context.
 */
export function FrameMark({ className }: FrameMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* corner brackets */}
      <path
        d="M2 12V4a2 2 0 0 1 2-2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 12V4a2 2 0 0 0-2-2h-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 28v8a2 2 0 0 0 2 2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 28v8a2 2 0 0 1-2 2h-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* dancer silhouette, mid-pose */}
      <circle cx="20" cy="12" r="2.6" fill="currentColor" />
      <path
        d="M20 15v7l-5 6M20 22l5 6M20 18l-6 3M20 18l6-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
