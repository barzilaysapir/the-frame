import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  readJsonBody,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import { enforceWriteRateLimit } from "@/lib/server/api/rate-limit";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type {
  CatalogExternalCourse,
  CatalogItemType,
  CatalogRoutine,
} from "@/lib/server/catalog/types";
import {
  addFavorite,
  listFavorites,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type FavoriteItem =
  | { itemType: "lesson"; slug: string; createdAt: string; routine: CatalogRoutine }
  | {
      itemType: "external_course";
      slug: string;
      createdAt: string;
      course: CatalogExternalCourse;
    };

function isCatalogItemType(value: unknown): value is CatalogItemType {
  return value === "lesson" || value === "internal_course" || value === "external_course";
}

export async function GET(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    // Locale only applies on first insert (new user row); existing users
    // keep whatever `locale_pref` they already have — see
    // `upsertUserFromClaims`.
    await upsertUserFromClaims(db, claims, locale);
    const [favorites, { repository, source }] = await Promise.all([
      listFavorites(db, claims.uid),
      resolveCatalog(),
    ]);

    // Fetch the full catalog once (batched internally) rather than issuing
    // getRoutine()/getExternalCourse() per favorite — same N+1 concern as
    // /api/v1/me/library.
    const [allRoutines, allExternalCourses] = await Promise.all([
      repository.listRoutines(locale),
      repository.listExternalCourses(locale),
    ]);
    const routineBySlug = new Map(
      allRoutines.map((routine) => [routine.slug, routine]),
    );
    const courseBySlug = new Map(
      allExternalCourses.map((course) => [course.slug, course]),
    );

    const items: FavoriteItem[] = [];
    for (const favorite of favorites) {
      if (favorite.itemType === "lesson") {
        const routine = routineBySlug.get(favorite.itemSlug);
        if (!routine) continue;
        items.push({
          itemType: "lesson",
          slug: favorite.itemSlug,
          createdAt: favorite.createdAt,
          routine,
        });
      } else if (favorite.itemType === "external_course") {
        const course = courseBySlug.get(favorite.itemSlug);
        if (!course) continue;
        items.push({
          itemType: "external_course",
          slug: favorite.itemSlug,
          createdAt: favorite.createdAt,
          course,
        });
      }
      // `internal_course` rows can't exist yet (POST/DELETE reject the type
      // below) — no branch needed until a catalog method backs it.
    }

    return NextResponse.json({ locale, source, items });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    await enforceWriteRateLimit(claims.uid);
    const db = await requireAppDb();
    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    await upsertUserFromClaims(db, claims, locale);

    const body = await readJsonBody<{ itemType?: unknown; slug?: unknown }>(
      request,
    );
    if (!isCatalogItemType(body.itemType)) {
      return NextResponse.json(
        { error: "itemType must be 'lesson', 'internal_course', or 'external_course'" },
        { status: 400 },
      );
    }
    if (typeof body.slug !== "string" || !body.slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    // Reserved for a future internally-hosted course — no catalog table/
    // method exists to validate or store one against yet.
    if (body.itemType === "internal_course") {
      return NextResponse.json(
        { error: "internal_course favorites are not supported yet" },
        { status: 501 },
      );
    }

    const { repository } = await resolveCatalog();
    const item =
      body.itemType === "lesson"
        ? await repository.getRoutine(locale, body.slug)
        : await repository.getExternalCourse(locale, body.slug);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await addFavorite(db, claims.uid, body.itemType, body.slug);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
