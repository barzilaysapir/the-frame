import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import { signLessonPlaybackUrl } from "@/lib/server/course-videos";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

/**
 * Mints a short-lived signed playback URL for one course lesson — requires
 * a valid Firebase ID token AND a paid purchase of the course (issue #232:
 * being signed in used to be enough, which let anyone watch any course for
 * free). The URL itself (not this endpoint) is what a native <video>
 * element loads, since it can't send an Authorization header.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    const { slug, lessonId } = await params;

    const { repository } = await resolveCatalog();
    const source = await repository.getExternalCourseLessonSource(
      slug,
      lessonId,
    );
    if (!source) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const paid = await hasPaidPurchase(db, claims.uid, "external_course", slug);
    if (!paid) {
      return NextResponse.json(
        { error: "Purchase required" },
        { status: 403 },
      );
    }

    const { url, expiresAt } = await signLessonPlaybackUrl(slug, lessonId);
    return NextResponse.json({ url, expiresAt });
  } catch (error) {
    return jsonError(error);
  }
}
