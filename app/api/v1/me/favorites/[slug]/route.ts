import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { enforceWriteRateLimit } from "@/lib/server/api/rate-limit";
import { removeFavorite } from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();
    const { slug } = await params;
    const itemType = request.nextUrl.searchParams.get("itemType");
    if (itemType !== "lesson" && itemType !== "external_course") {
      return NextResponse.json(
        { error: "itemType must be 'lesson' or 'external_course'" },
        { status: 400 },
      );
    }
    await removeFavorite(db, claims.uid, itemType, slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
