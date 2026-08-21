"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CourseLandingPreview } from "@/components/courses/CourseLandingPreview";
import { CourseWatchPage } from "@/components/courses/CourseWatchPage";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseAccessGateProps {
  course: CatalogExternalCourse;
  locale: Locale;
  priceIls: number;
  dict: Dictionary;
}

type AccessStatus = "none" | "paid";

/**
 * Decides which full page layout to show for a purchasable external
 * course: the marketing/preview + embedded checkout (CourseLandingPreview)
 * for anyone who doesn't own it yet, or the lesson player (CourseWatchPage)
 * for buyers who do. No server-side auth session exists in this app, so
 * the check happens client-side against the lightweight
 * GET /api/v1/me/purchases/status — defaults to the preview layout while
 * checking (and for signed-out visitors) rather than flashing watch UI.
 *
 * Do not treat uPay's `?payment=success` as ownership — that query is
 * always present on returnurl, paid or not.
 */
export function CourseAccessGate({
  course,
  locale,
  priceIls,
  dict,
}: CourseAccessGateProps) {
  const { user, loading: authLoading } = useAuth();
  // Only the async fetch result needs state — "not signed in" is derived
  // directly below instead of set via an effect, since there's no async
  // work involved and setState synchronously inside an effect body is
  // flagged by react-hooks/set-state-in-effect.
  const [fetchedStatus, setFetchedStatus] = useState<AccessStatus>("none");

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithAuth(
          user,
          `/api/v1/me/purchases/status?itemType=external_course&itemSlug=${encodeURIComponent(course.slug)}`,
        );
        if (!res.ok) {
          throw new Error(`purchase status check failed with ${res.status}`);
        }
        const data = (await res.json()) as { status: "paid" | "none" };
        if (!cancelled) setFetchedStatus(data.status);
      } catch (error) {
        console.error("[CourseAccessGate] purchase status check failed:", error);
        if (!cancelled) setFetchedStatus("none");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, course.slug]);

  const owned = !authLoading && !!user && fetchedStatus === "paid";

  if (owned) {
    return <CourseWatchPage course={course} locale={locale} dict={dict} />;
  }

  return (
    <CourseLandingPreview
      course={course}
      locale={locale}
      priceIls={priceIls}
      dict={dict}
    />
  );
}
