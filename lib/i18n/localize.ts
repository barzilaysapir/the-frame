/**
 * Resolves **display** fields for catalog entities.
 * Today reads `mocks/content`; later prefer server-provided locale fields
 * on routine/instructor payloads and keep this module as a thin adapter.
 */
import type { Locale } from "@/lib/i18n/config";
import { getMockContent } from "@/mocks/get-content";
import type { ExternalCourseRecord } from "@/lib/external-courses";
import type { InstructorRecord } from "@/lib/instructors";
import type { CatalogExternalCourseFeature } from "@/lib/server/catalog/types";
import type {
  ChapterId,
  DanceStyleKey,
  LevelKey,
  RoutineRecord,
  VideoChapter,
} from "@/lib/routines";

export function localizeStyle(locale: Locale, style: DanceStyleKey): string {
  return getMockContent(locale).styles[style];
}

export function localizeLevel(locale: Locale, level: LevelKey): string {
  return getMockContent(locale).levels[level];
}

function localizeChapter(locale: Locale, chapterId: ChapterId): string {
  return getMockContent(locale).chapters[chapterId];
}

function localizeChapters(
  locale: Locale,
  chapters: VideoChapter[],
): Array<VideoChapter & { label: string }> {
  return chapters.map((chapter) => ({
    ...chapter,
    label: localizeChapter(locale, chapter.id),
  }));
}

export function localizeRoutine(
  locale: Locale,
  routine: RoutineRecord,
): {
  style: string;
  level: string;
  length: string;
  technique: string;
  description: string;
  chapters: Array<VideoChapter & { label: string }>;
} {
  const content = getMockContent(locale);
  const copy =
    content.routines[routine.slug as keyof typeof content.routines];

  return {
    style: content.styles[routine.style],
    level: content.levels[routine.level],
    length: `${routine.length} ${content.minutes}`,
    technique: copy?.technique ?? "",
    description: copy?.description ?? "",
    chapters: localizeChapters(locale, routine.chapters),
  };
}

export function localizeInstructor(
  locale: Locale,
  instructor: InstructorRecord,
): {
  name: string;
  role: string;
  bio: string;
} {
  const content = getMockContent(locale);
  const copy =
    content.instructors[
      instructor.slug as keyof typeof content.instructors
    ];

  return {
    name: copy?.name ?? instructor.slug,
    role: content.styles[instructor.style],
    bio: copy?.bio ?? "",
  };
}

export function localizeExternalCourse(
  locale: Locale,
  course: ExternalCourseRecord,
): {
  title: string;
  provider: string;
  tagline: string;
  description: string;
  curriculumHeading: string;
  curriculumTopics: string[];
  features: CatalogExternalCourseFeature[];
} {
  const content = getMockContent(locale);
  const copy =
    content.externalCourses[
      course.slug as keyof typeof content.externalCourses
    ] as
      | {
          title?: string;
          provider?: string;
          tagline?: string;
          description?: string;
          curriculumHeading?: string;
          curriculumTopics?: string[];
          features?: CatalogExternalCourseFeature[];
        }
      | undefined;

  return {
    title: copy?.title ?? course.slug,
    provider: copy?.provider ?? course.provider,
    tagline: copy?.tagline ?? "",
    description: copy?.description ?? "",
    curriculumHeading: copy?.curriculumHeading ?? "",
    curriculumTopics: copy?.curriculumTopics ?? [],
    features: copy?.features ?? [],
  };
}

/** Localized title for one lesson of a course with real (non-mock) video content. */
export function localizeExternalCourseLessonTitle(
  locale: Locale,
  courseSlug: string,
  lessonId: string,
): string {
  const content = getMockContent(locale);
  const copy =
    content.externalCourses[
      courseSlug as keyof typeof content.externalCourses
    ];
  const lessons = (copy as { lessons?: Record<string, { title: string }> })
    ?.lessons;
  return lessons?.[lessonId]?.title ?? lessonId;
}
