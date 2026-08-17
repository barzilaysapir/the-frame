import { Instagram } from "lucide-react";
import { InstructorAvatar } from "@/components/instructors/InstructorAvatar";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

interface InstructorCardHeaderProps {
  name: string;
  role: string;
  avatar: string;
  instagramUrl: string;
  instagramAriaLabel: string;
  avatarEnlargeAriaLabel: string;
  avatarLightboxCloseAriaLabel: string;
}

export function InstructorCardHeader({
  name,
  role,
  avatar,
  instagramUrl,
  instagramAriaLabel,
  avatarEnlargeAriaLabel,
  avatarLightboxCloseAriaLabel,
}: InstructorCardHeaderProps) {
  const avatarElement = <InstructorAvatar name={name} src={avatar} className="h-12 w-12" />;

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <ImageLightbox
          src={avatar}
          alt={name}
          trigger={
            <button
              type="button"
              className="rounded-full transition-opacity hover:opacity-80"
            >
              {avatarElement}
            </button>
          }
          triggerAriaLabel={avatarEnlargeAriaLabel}
          closeAriaLabel={avatarLightboxCloseAriaLabel}
        />
      ) : (
        avatarElement
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl font-black text-white">
            {name}
          </h3>
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
        <p className="text-sm text-frame-silver">{role}</p>
      </div>
    </div>
  );
}
