"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CourseLessonPlayer } from "@/components/courses/CourseLessonPlayer";
import { CourseLessonPlaylist } from "@/components/courses/CourseLessonPlaylist";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourseLesson } from "@/lib/server/catalog/types";

interface CourseWatchProps {
  courseSlug: string;
  lessons: CatalogExternalCourseLesson[];
  checkoutHref: string;
  playerLabels: Dictionary["player"];
  loginErrors: Dictionary["login"]["errors"];
  lessonsHeading: string;
  playerChrome: {
    signInPrompt: string;
    signInCta: string;
    loading: string;
    unavailable: string;
    purchaseRequired: string;
    purchaseRequiredCta: string;
  };
}

export function CourseWatch({
  courseSlug,
  lessons,
  checkoutHref,
  playerLabels,
  loginErrors,
  lessonsHeading,
  playerChrome,
}: CourseWatchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedLesson = useMemo(() => {
    const fromUrl = searchParams.get("lesson");
    return lessons.find((lesson) => lesson.id === fromUrl) ?? lessons[0];
  }, [lessons, searchParams]);

  const selectLesson = useCallback(
    (lessonId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lesson", lessonId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (!selectedLesson) return null;

  return (
    <div className="flex flex-col gap-8">
      <CourseLessonPlayer
        key={selectedLesson.id}
        courseSlug={courseSlug}
        lesson={selectedLesson}
        checkoutHref={checkoutHref}
        playerLabels={playerLabels}
        loginErrors={loginErrors}
        labels={playerChrome}
      />
      <CourseLessonPlaylist
        lessons={lessons}
        selectedLessonId={selectedLesson.id}
        onSelect={selectLesson}
        heading={lessonsHeading}
      />
    </div>
  );
}
