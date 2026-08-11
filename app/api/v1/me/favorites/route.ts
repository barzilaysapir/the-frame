import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type { CatalogRoutine } from "@/lib/server/catalog/types";
import {
  addFavorite,
  listFavorites,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface FavoriteItem {
  routineSlug: string;
  createdAt: string;
  routine: CatalogRoutine;
}

export async function GET(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    await upsertUserFromClaims(db, claims);

    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    const [favorites, { repository, source }] = await Promise.all([
      listFavorites(db, claims.uid),
      resolveCatalog(),
    ]);

    // Fetch the full catalog once (batched internally) rather than issuing
    // getRoutine() per favorite — same N+1 concern as /api/v1/me/library.
    const allRoutines = await repository.listRoutines(locale);
    const routineBySlug = new Map(
      allRoutines.map((routine) => [routine.slug, routine]),
    );

    const items: FavoriteItem[] = [];
    for (const favorite of favorites) {
      const routine = routineBySlug.get(favorite.routineSlug);
      if (!routine) continue;
      items.push({
        routineSlug: favorite.routineSlug,
        createdAt: favorite.createdAt,
        routine,
      });
    }

    return NextResponse.json({ locale, source, items });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    await upsertUserFromClaims(db, claims);

    const body = (await request.json()) as { routineSlug?: unknown };
    if (typeof body.routineSlug !== "string" || !body.routineSlug) {
      return NextResponse.json(
        { error: "routineSlug is required" },
        { status: 400 },
      );
    }

    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    const { repository } = await resolveCatalog();
    const routine = await repository.getRoutine(locale, body.routineSlug);
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    await addFavorite(db, claims.uid, body.routineSlug);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
