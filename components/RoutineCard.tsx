import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { RoutineRecord } from "@/lib/routines";

interface RoutineCardProps {
  routine: RoutineRecord;
  instructorName?: string;
}

export function RoutineCard({ routine, instructorName }: RoutineCardProps) {
  return (
    <Link
      href={`/routine/${routine.slug}`}
      className="group block overflow-hidden rounded-2xl border border-frame-border bg-frame-panel transition-colors hover:border-frame-cyan/60"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={routine.poster}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-4">
          <span className="rounded-full bg-frame-magenta px-2.5 py-1 text-[11px] font-bold text-frame-bg">
            {routine.style}
          </span>
          <span className="rounded-full border border-white/30 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            {routine.level}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-2xl font-black text-white">
          <span dir="ltr" className="inline-block">
            {routine.title}
            <span className="font-sans text-base font-medium text-frame-silver">
              {" "}
              — {routine.artist}
            </span>
          </span>
        </h3>
        {instructorName && (
          <p className="mt-1 text-sm text-frame-silver">בהנחיית {instructorName}</p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-frame-border pt-4">
          <div dir="ltr" className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">
              ₪{routine.pricing.earlyBird}
            </span>
            <span className="text-xs font-medium text-frame-muted line-through">
              ₪{routine.pricing.original}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-frame-cyan">
            צפו בקומבינציה
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default RoutineCard;
