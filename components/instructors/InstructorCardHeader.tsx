import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/instructors/InstructorAvatar";

interface InstructorCardHeaderProps {
  name: string;
  role: string;
  avatar: string;
  instagramUrl: string;
  instagramAriaLabel: string;
}

export function InstructorCardHeader({
  name,
  role,
  avatar,
  instagramUrl,
  instagramAriaLabel,
}: InstructorCardHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <InstructorAvatar name={name} src={avatar} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl font-black text-white">
            {name}
          </h3>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto relative z-20 rounded-sm text-frame-cyan transition-colors hover:text-white"
            aria-label={instagramAriaLabel}
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
        <p className="text-sm text-frame-silver">{role}</p>
      </div>
    </div>
  );
}
