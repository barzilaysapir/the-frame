"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DanceVideoPlayer } from "@/components/player/DanceVideoPlayer";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import {
  getGoogleSignInErrorMessage,
  signInWithGoogle,
} from "@/lib/client/sign-in-with-google";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourseLesson } from "@/lib/server/catalog/types";

interface CourseLessonPlayerProps {
  courseSlug: string;
  lesson: CatalogExternalCourseLesson;
  playerLabels: Dictionary["player"];
  loginErrors: Dictionary["login"]["errors"];
  labels: {
    signInPrompt: string;
    signInCta: string;
    loading: string;
    unavailable: string;
  };
}

/**
 * Login-gated lesson player. Signed-out visitors see a sign-in prompt;
 * signed-in visitors get a short-lived signed playback URL fetched with
 * their Firebase ID token, then handed to the same `<video>`-based player
 * routines use — the gating lives entirely in how `src` is obtained, not in
 * the player itself.
 */
export function CourseLessonPlayer({
  courseSlug,
  lesson,
  playerLabels,
  loginErrors,
  labels,
}: CourseLessonPlayerProps) {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setPlaybackUrl(null);
    setFetchFailed(false);
    (async () => {
      try {
        const res = await fetchWithAuth(
          user,
          `/api/v1/external-courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lesson.id)}/playback-url`,
        );
        if (!res.ok) {
          throw new Error(`playback-url request failed with ${res.status}`);
        }
        const data = (await res.json()) as { url: string };
        if (!cancelled) {
          setPlaybackUrl(data.url);
          setFetchFailed(false);
        }
      } catch (error) {
        console.error("[CourseLessonPlayer] failed to get playback URL:", error);
        if (!cancelled) {
          setFetchFailed(true);
          setPlaybackUrl(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseSlug, lesson.id]);

  const handleSignIn = async () => {
    setSignInError(null);
    if (!isConfigured) {
      setSignInError(loginErrors.generic);
      return;
    }
    setSignInBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("[CourseLessonPlayer sign-in]", error);
      setSignInError(getGoogleSignInErrorMessage(error, loginErrors));
    } finally {
      setSignInBusy(false);
    }
  };

  if (authLoading) {
    return <PlaceholderFrame>{labels.loading}</PlaceholderFrame>;
  }

  if (!user) {
    return (
      <PlaceholderFrame>
        <p className="text-sm text-frame-silver">{labels.signInPrompt}</p>
        <Button
          onClick={handleSignIn}
          disabled={signInBusy}
          aria-busy={signInBusy}
          className="w-fit px-6"
        >
          {labels.signInCta}
        </Button>
        {signInError ? (
          <p role="alert" className="text-xs text-frame-magenta">
            {signInError}
          </p>
        ) : null}
      </PlaceholderFrame>
    );
  }

  if (fetchFailed) {
    return <PlaceholderFrame>{labels.unavailable}</PlaceholderFrame>;
  }

  if (!playbackUrl) {
    return <PlaceholderFrame>{labels.loading}</PlaceholderFrame>;
  }

  return (
    <DanceVideoPlayer
      src={playbackUrl}
      title={lesson.title}
      chapters={[]}
      labels={playerLabels}
      showMirror={lesson.allowMirror}
    />
  );
}

function PlaceholderFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-frame-border bg-black/40 px-6 text-center">
      {children}
    </div>
  );
}
