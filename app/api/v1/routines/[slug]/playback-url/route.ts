import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import { getVideoSigningKey } from "@/lib/server/course-videos";
import {
  mintPlaybackGateValue,
  playbackGateSetCookie,
} from "@/lib/server/playback-hotlink";
import {
  canPresignR2Playback,
  readPlaybackStorageStatus,
} from "@/lib/server/r2-presign";
import {
  isExternalRoutineVideoSrc,
  signRoutinePlaybackUrl,
} from "@/lib/server/routine-videos";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Mints a short-lived same-origin `/stream` URL for a routine — requires a
 * valid Firebase ID token AND a paid purchase (issue #232). `/stream` 307s
 * to a presigned R2 GET for real keys. Demo `https://` sources stay on
 * `/stream`.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    const { slug } = await params;

    const { repository } = await resolveCatalog();
    const source = await repository.getRoutineVideoSource(slug);
    if (!source) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    const paid = await hasPaidPurchase(db, claims.uid, "lesson", slug);
    if (!paid) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }

    const playback = await readPlaybackStorageStatus();
    if (!playback.videoSigningConfigured) {
      throw new ApiError(503, "Video signing is not configured on this Worker");
    }
    if (
      !isExternalRoutineVideoSrc(source.videoSrc) &&
      !canPresignR2Playback(playback)
    ) {
      throw new ApiError(
        503,
        "R2 API token is not configured on this Worker",
      );
    }

    const { url, expiresAt } = await signRoutinePlaybackUrl(slug);
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
