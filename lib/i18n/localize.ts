import type { Locale } from "@/lib/i18n/config";
import {
  formatMessage,
  getDictionarySync,
  type Dictionary,
} from "@/lib/i18n/get-dictionary";
import type { InstructorRecord } from "@/lib/instructors";
import type {
  ChapterId,
  DanceStyleKey,
  LevelKey,
  RoutineRecord,
  VideoChapter,
} from "@/lib/routines";

export function localizeStyle(locale: Locale, style: DanceStyleKey): string {
  return getDictionarySync(locale).content.styles[style];
}

export function localizeLevel(locale: Locale, level: LevelKey): string {
  return getDictionarySync(locale).content.levels[level];
}

export function localizeChapter(
  locale: Locale,
  chapterId: ChapterId,
): string {
  return getDictionarySync(locale).content.chapters[chapterId];
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
  const dict = getDictionarySync(locale);
  const copy = dict.content.routines[routine.slug as keyof typeof dict.content.routines];

  return {
    style: dict.content.styles[routine.style],
    level: dict.content.levels[routine.level],
    length: `${routine.length} ${dict.content.minutes}`,
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
  const dict = getDictionarySync(locale);
  const copy =
    dict.content.instructors[
      instructor.slug as keyof typeof dict.content.instructors
    ];

  return {
    name: copy?.name ?? instructor.slug,
    role: dict.content.styles[instructor.style],
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
    style: dict.content.styles[styleKey],
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
    style: dict.content.styles[styleKey],
    instructor: instructorName,
  });
}
