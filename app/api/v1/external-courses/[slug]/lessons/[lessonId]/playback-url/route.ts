import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import {
  getVideoSigningKey,
  signLessonPlaybackUrl,
} from "@/lib/server/course-videos";
import {
  mintPlaybackGateValue,
  playbackGateSetCookie,
} from "@/lib/server/playback-hotlink";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

/**
 * Mints a short-lived playback URL for one course lesson — requires a
 * valid Firebase ID token AND a paid purchase of the course (issue #232).
 * Prefers a presigned R2 GET when credentials exist (required to avoid
 * Worker 1102). HMAC `/stream` 302s to R2 when it can. Sets a cookie so
 * leftover `/stream` URLs still work in the player.
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

    const { url, expiresAt } = await signLessonPlaybackUrl(
      slug,
      lessonId,
      source.r2Key,
    );
    const gate = await mintPlaybackGateValue(
      await getVideoSigningKey(),
      expiresAt,
    );
    const response = NextResponse.json({ url, expiresAt });
    response.headers.append(
      "set-cookie",
      playbackGateSetCookie(gate, expiresAt, request.url),
    );
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
