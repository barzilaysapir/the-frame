"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CourseLandingPreview } from "@/components/courses/CourseLandingPreview";
import { CourseWatchPage } from "@/components/courses/CourseWatchPage";
import { completeUpayReturn } from "@/lib/client/complete-upay-return";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { CatalogExternalCourse } from "@/lib/server/catalog/types";

interface CourseAccessGateProps {
  course: CatalogExternalCourse;
  locale: Locale;
  priceIls: number;
  dict: Dictionary;
}

type AccessStatus = "checking" | "none" | "paid";

/**
 * Decides which full page layout to show for a purchasable external
 * course: the marketing/preview + embedded checkout (CourseLandingPreview)
 * for anyone who doesn't own it yet, or the lesson player (CourseWatchPage)
 * for buyers who do. No server-side auth session exists in this app, so
 * the check happens client-side against the lightweight
 * GET /api/v1/me/purchases/status — defaults to the preview layout while
 * checking (and for signed-out visitors) rather than flashing watch UI.
 */
export function CourseAccessGate({
  course,
  locale,
  priceIls,
  dict,
}: CourseAccessGateProps) {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const returnedFromPayment = searchParams.get("payment");
  const purchaseId = searchParams.get("purchaseId");
  // Only the async fetch result needs state — "not signed in" is derived
  // directly below instead of set via an effect, since there's no async
  // work involved and setState synchronously inside an effect body is
  // flagged by react-hooks/set-state-in-effect.
  const [fetchedStatus, setFetchedStatus] = useState<"checking" | "none" | "paid">(
    "checking",
  );

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const paid = await completeUpayReturn(
          user,
          "external_course",
          course.slug,
          returnedFromPayment === "success" ? purchaseId : null,
        );
        if (!cancelled) setFetchedStatus(paid ? "paid" : "none");
      } catch (error) {
        console.error("[CourseAccessGate] purchase status check failed:", error);
        if (!cancelled) setFetchedStatus("none");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, course.slug, returnedFromPayment, purchaseId]);

  const status: AccessStatus = authLoading
    ? "checking"
    : !user
      ? "none"
      : fetchedStatus;

  if (status === "paid") {
    return <CourseWatchPage course={course} locale={locale} dict={dict} />;
  }

  if (status === "checking") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-frame-silver">
          {dict.externalCourses.checkingAccess}
        </p>
      </main>
    );
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
