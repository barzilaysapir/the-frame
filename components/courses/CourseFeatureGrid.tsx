import {
  Footprints,
  Heart,
  Home,
  Infinity,
  ListOrdered,
  Music,
  PersonStanding,
  Sparkles,
  Users,
} from "lucide-react";
import type { CourseFeatureIcon } from "@/lib/server/catalog/types";
import { cn } from "@/lib/utils";

const ICONS: Record<CourseFeatureIcon, typeof Sparkles> = {
  sparkles: Sparkles,
  footprints: Footprints,
  home: Home,
  infinity: Infinity,
  music: Music,
  heart: Heart,
  standing: PersonStanding,
  users: Users,
  list: ListOrdered,
};

interface CourseFeatureGridProps {
  features: { icon: CourseFeatureIcon; label: string }[];
  className?: string;
}

export function CourseFeatureGrid({
  features,
  className,
}: CourseFeatureGridProps) {
  if (features.length === 0) return null;

  return (
    <div
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}
    >
      {features.map((feature) => {
        const Icon = ICONS[feature.icon];
        return (
          <div
            key={feature.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-frame-border/70 bg-frame-panel/40 p-4 text-center"
          >
            <Icon className="h-5 w-5 text-frame-cyan" aria-hidden="true" />
            <span className="text-xs text-frame-silver">{feature.label}</span>
          </div>
        );
      })}
    </div>
  );
}
