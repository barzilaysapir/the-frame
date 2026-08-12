import Link from "next/link";

export interface RoutineFilterChip {
  label: string;
  href: string;
  active: boolean;
}

interface RoutineFilterGroupProps {
  label: string;
  chips: RoutineFilterChip[];
}

function chipClass(active: boolean) {
  return `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "bg-frame-cyan/15 text-frame-cyan ring-1 ring-inset ring-frame-cyan/70"
      : "text-frame-silver hover:bg-white/5 hover:text-white"
  }`;
}

export function RoutineFilterGroup({ label, chips }: RoutineFilterGroupProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
      <p className="w-14 shrink-0 text-xs font-semibold text-frame-muted">{label}</p>
      <div className="-mx-1.5 flex flex-wrap gap-0.5" role="list">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            role="listitem"
            aria-current={chip.active ? "true" : undefined}
            className={chipClass(chip.active)}
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
