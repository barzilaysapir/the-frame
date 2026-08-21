import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireAppDb, requireFirebaseClaims } from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import { getVideoSigningKey } from "@/lib/server/course-videos";
import {
  mintPlaybackGateValue,
  playbackGateSetCookie,
} from "@/lib/server/playback-hotlink";
import { signRoutinePlaybackUrl } from "@/lib/server/routine-videos";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Mints a short-lived playback URL for a routine — requires a valid
 * Firebase ID token AND a paid purchase of the routine (issue #232).
 * HMAC `/stream` falls back when R2 credentials are missing; that route
 * 302s to a presigned GET when it can. Demo `https://` sources always use
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

    const { url, expiresAt } = await signRoutinePlaybackUrl(slug, source.videoSrc);
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
