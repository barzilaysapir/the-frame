import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { RoutineRecord } from "@/lib/routines";
import { SongCredit } from "@/components/SongCredit";
import { RoutineFilterTag } from "@/components/RoutineFilterTag";

interface RoutineCardProps {
  routine: RoutineRecord;
  instructorName?: string;
}

export function RoutineCard({ routine, instructorName }: RoutineCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-frame-border bg-frame-panel transition-colors hover:border-frame-cyan/60">
      <div className="relative aspect-video w-full overflow-hidden">
        <Link href={`/routine/${routine.slug}`} className="absolute inset-0 block">
          <Image
            src={routine.poster}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 p-4">
          <RoutineFilterTag
            label={routine.style}
            variant="style"
            size="sm"
            className="pointer-events-auto"
          />
          <RoutineFilterTag
            label={routine.level}
            variant="level"
            size="sm"
            className="pointer-events-auto"
          />
        </div>
      </div>

      <Link href={`/routine/${routine.slug}`} className="block p-5">
        <SongCredit songName={routine.title} artist={routine.artist} />
        {instructorName && (
          <p className="mt-2 text-sm text-frame-silver">בהנחיית {instructorName}</p>
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
      </Link>
    </article>
  );
}

export default RoutineCard;
