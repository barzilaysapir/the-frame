import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireAppDb, requireFirebaseClaims } from "@/lib/server/api/auth-context";
import { resolveCatalog } from "@/lib/server/catalog";
import { signRoutinePlaybackUrl } from "@/lib/server/routine-videos";
import { hasPaidPurchase } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Mints a short-lived signed playback URL for a routine — requires a valid
 * Firebase ID token AND a paid purchase of the routine (issue #232: the
 * routine page used to hand `videoSrc` straight to the client, unauthenticated,
 * not even requiring sign-in). Mirrors the external-course lesson
 * playback-url route.
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

    const { url, expiresAt } = await signRoutinePlaybackUrl(slug);
    return NextResponse.json({ url, expiresAt });
  } catch (error) {
    return jsonError(error);
  }
}
