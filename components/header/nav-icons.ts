import { Library, Sparkles, Users, Info, type LucideIcon } from "lucide-react";
import type { NavLinkId } from "@/lib/nav-links";

/** Icons for primary nav links — shared by desktop header and mobile bottom bar. */
export const NAV_ICONS: Record<NavLinkId, LucideIcon> = {
  tutorials: Library,
  styles: Sparkles,
  teachers: Users,
  about: Info,
};
