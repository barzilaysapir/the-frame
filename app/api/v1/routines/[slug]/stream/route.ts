import { NextRequest, NextResponse } from "next/server";
import { resolveCatalog } from "@/lib/server/catalog";
import { getVideoSigningKey } from "@/lib/server/course-videos";
import {
  PLAYBACK_GATE_COOKIE,
  verifyPlaybackGateValue,
} from "@/lib/server/playback-hotlink";
import { redirectToPresignedR2 } from "@/lib/server/r2-stream-redirect";
import {
  isExternalRoutineVideoSrc,
  verifyRoutinePlaybackSignature,
} from "@/lib/server/routine-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Same-origin `<video src>` for a routine. Cookie + HMAC gate, then 307
 * to a presigned R2 GET for real keys. Demo `https://` sources are fetched
 * upstream (short sample clips, not class-length R2 objects).
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

  const { slug } = await params;
  const { searchParams } = request.nextUrl;

  const isValid = await verifyRoutinePlaybackSignature(
    slug,
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
  const source = await repository.getRoutineVideoSource(slug);
  if (!source) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  if (isExternalRoutineVideoSrc(source.videoSrc)) {
    const rangeHeader = request.headers.get("range");
    const upstream = await fetch(
      source.videoSrc,
      rangeHeader ? { headers: { range: rangeHeader } } : undefined,
    );
    const headers = new Headers(upstream.headers);
    headers.set("content-disposition", "inline");
    headers.set("cache-control", "private, max-age=0, no-store");
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  }

  return redirectToPresignedR2(source.videoSrc, searchParams.get("exp"));
}

export { GET as HEAD };
