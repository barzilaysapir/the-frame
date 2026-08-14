import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireFirebaseClaims } from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import { signLessonPlaybackUrl } from "@/lib/server/course-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

/**
 * Mints a short-lived signed playback URL for one course lesson — requires
 * a valid Firebase ID token. The URL itself (not this endpoint) is what a
 * native <video> element loads, since it can't send an Authorization header.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireFirebaseClaims(request);
    const { slug, lessonId } = await params;

    const { repository } = await resolveCatalog();
    const source = await repository.getExternalCourseLessonSource(
      slug,
      lessonId,
    );
    if (!source) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const { url, expiresAt } = await signLessonPlaybackUrl(slug, lessonId);
    return NextResponse.json({ url, expiresAt });
  } catch (error) {
    return jsonError(error);
  }
}
