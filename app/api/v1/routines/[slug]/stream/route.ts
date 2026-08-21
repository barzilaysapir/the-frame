import { NextRequest, NextResponse } from "next/server";
import { resolveCatalog } from "@/lib/server/catalog";
import {
  getRoutineVideosBucket,
  parseRangeHeader,
  describeR2VideoRange,
  applyR2VideoContentType,
  verifyRoutinePlaybackSignature,
} from "@/lib/server/routine-videos";
import { getVideoSigningKey } from "@/lib/server/course-videos";
import {
  PLAYBACK_GATE_COOKIE,
  verifyPlaybackGateValue,
} from "@/lib/server/playback-hotlink";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function copyR2HttpMetadata(
  headers: Headers,
  metadata: R2HTTPMetadata | undefined,
) {
  if (!metadata) return;
  if (metadata.contentType) headers.set("content-type", metadata.contentType);
  if (metadata.contentLanguage) {
    headers.set("content-language", metadata.contentLanguage);
  }
  if (metadata.contentDisposition) {
    headers.set("content-disposition", metadata.contentDisposition);
  }
  if (metadata.contentEncoding) {
    headers.set("content-encoding", metadata.contentEncoding);
  }
}

/** Real routine video sources are private R2 keys; demo/mock ones are plain external URLs (see `lib/server/routine-videos.ts`). */
function isExternalUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * HMAC fallback: streams one routine's video. Used when playback-url cannot
 * mint a presigned R2 GET (missing S3 API token, or a demo `https://`
 * videoSrc). Gated by a signed `exp`/`sig` query pair rather than a
 * Firebase Bearer token — a native <video src> request can't carry a
 * custom Authorization header.
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

  if (isExternalUrl(source.videoSrc)) {
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

  const bucket = await getRoutineVideosBucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Video storage unavailable" },
      { status: 503 },
    );
  }

  const range = parseRangeHeader(request.headers.get("range"));
  const object = await bucket.get(
    source.videoSrc,
    range ? { range } : undefined,
  );
  if (!object) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const headers = new Headers();
  // Do not call `object.writeHttpMetadata(headers)` in next/dev: Miniflare's
  // R2 proxy tries to serialize the undici/Next Headers object with devalue
  // and throws `DevalueError: Cannot stringify arbitrary non-POJOs`.
  copyR2HttpMetadata(headers, object.httpMetadata);
  applyR2VideoContentType(headers);
  headers.set("content-disposition", "inline");
  headers.set("accept-ranges", "bytes");
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=0, no-store");

  if (range) {
    const described = describeR2VideoRange(range, object.size, object.range);
    if (!described) {
      headers.set("content-range", `bytes */${object.size}`);
      return new NextResponse(null, { status: 416, headers });
    }
    headers.set(
      "content-range",
      `bytes ${described.start}-${described.end}/${object.size}`,
    );
    headers.set("content-length", String(described.length));
    return new NextResponse(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(object.size));
  return new NextResponse(object.body, { status: 200, headers });
}
