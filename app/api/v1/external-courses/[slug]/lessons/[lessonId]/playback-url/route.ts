import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
  ApiError,
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
import {
  canPresignR2Playback,
  readPlaybackStorageStatus,
} from "@/lib/server/r2-presign";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

/**
 * Mints a short-lived same-origin `/stream` URL for one course lesson —
 * requires a valid Firebase ID token AND a paid purchase (issue #232).
 * Sets a cookie so `<video>` can GET `/stream`, which 307s to R2.
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

    const playback = await readPlaybackStorageStatus();
    if (!playback.videoSigningConfigured) {
      throw new ApiError(503, "Video signing is not configured on this Worker");
    }
    if (!canPresignR2Playback(playback)) {
      throw new ApiError(
        503,
        "R2 API token is not configured on this Worker",
      );
    }

    const { url, expiresAt } = await signLessonPlaybackUrl(slug, lessonId);
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
