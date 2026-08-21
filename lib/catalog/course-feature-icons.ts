/**
 * Runtime list of Lucide keys the course feature grid can render.
 * Keep this in sync with CourseFeatureGrid. Unknown keys from D1 must be
 * dropped — an unmapped icon rendered as `<undefined />` throws, React
 * retries the RSC stream, and the Worker can 1102.
 */
export const COURSE_FEATURE_ICONS = [
  "sparkles",
  "footprints",
  "home",
  "infinity",
  "music",
  "heart",
  "standing",
  "users",
  "list",
] as const;

export type CourseFeatureIcon = (typeof COURSE_FEATURE_ICONS)[number];

export function isCourseFeatureIcon(value: string): value is CourseFeatureIcon {
  return (COURSE_FEATURE_ICONS as readonly string[]).includes(value);
}
