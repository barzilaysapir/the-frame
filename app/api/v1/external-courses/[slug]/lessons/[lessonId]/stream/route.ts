import { NextRequest, NextResponse } from "next/server";
import { resolveCatalog } from "@/lib/server/catalog";
import {
  getVideoSigningKey,
  verifyLessonPlaybackSignature,
} from "@/lib/server/course-videos";
import {
  PLAYBACK_GATE_COOKIE,
  verifyPlaybackGateValue,
} from "@/lib/server/playback-hotlink";
import { redirectToPresignedR2 } from "@/lib/server/r2-stream-redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

/**
 * Same-origin `<video src>` for one lesson. Cookie + HMAC gate, then 307
 * to a presigned R2 GET. Never copies object bytes (Worker 1102).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const gateOk = await verifyPlaybackGateValue(
    await getVideoSigningKey(),
    request.cookies.get(PLAYBACK_GATE_COOKIE)?.value,
  );
  if (!gateOk) {
    return NextResponse.json(
      { error: "Playback is only available in the player" },
      { status: 403 },
    );
  }

  const { slug, lessonId } = await params;
  const { searchParams } = request.nextUrl;

  const isValid = await verifyLessonPlaybackSignature(
    slug,
    lessonId,
    searchParams.get("exp"),
    searchParams.get("sig"),
  );
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or expired playback link" },
      { status: 403 },
    );
  }

  const { repository } = await resolveCatalog();
  const source = await repository.getExternalCourseLessonSource(
    slug,
    lessonId,
  );
  if (!source) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return redirectToPresignedR2(source.r2Key, searchParams.get("exp"));
}

export { GET as HEAD };
