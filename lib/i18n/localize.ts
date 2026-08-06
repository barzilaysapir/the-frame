import type { Locale } from "@/lib/i18n/config";
import {
  formatMessage,
  getDictionarySync,
  type Dictionary,
} from "@/lib/i18n/get-dictionary";
import { getMockContent } from "@/mocks/get-content";
import type { InstructorRecord } from "@/lib/instructors";
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

export function localizeChapter(
  locale: Locale,
  chapterId: ChapterId,
): string {
  return getMockContent(locale).chapters[chapterId];
}

export function localizeChapters(
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

export function getPlayerLabels(locale: Locale): Dictionary["player"] {
  return getDictionarySync(locale).player;
}

export function routineMetaTitle(
  locale: Locale,
  title: string,
  styleKey: DanceStyleKey,
): string {
  const dict = getDictionarySync(locale);
  return formatMessage(dict.routine.metaTitle, {
    title,
    style: getMockContent(locale).styles[styleKey],
  });
}

export function routineMetaDescription(
  locale: Locale,
  title: string,
  styleKey: DanceStyleKey,
  instructorName: string,
): string {
  const dict = getDictionarySync(locale);
  return formatMessage(dict.routine.metaDescription, {
    title,
    style: getMockContent(locale).styles[styleKey],
    instructor: instructorName,
  });
}
