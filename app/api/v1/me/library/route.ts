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
import type { CatalogExternalCourse, CatalogRoutine } from "@/lib/server/catalog/types";
import {
  listPaidPurchases,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type LibraryItem =
  | {
      purchaseId: string;
      paidAt: string | null;
      itemType: "lesson";
      routine: CatalogRoutine;
    }
  | {
      purchaseId: string;
      paidAt: string | null;
      itemType: "external_course";
      course: CatalogExternalCourse;
    };

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
    const [purchases, { repository, source }] = await Promise.all([
      listPaidPurchases(db, claims.uid),
      resolveCatalog(),
    ]);

    // Fetch the full catalog once (batched internally) rather than issuing
    // getRoutine()/getExternalCourse() per purchase — same N+1 concern as
    // /api/v1/me/favorites.
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

    const items: LibraryItem[] = [];
    for (const purchase of purchases) {
      if (purchase.itemType === "lesson") {
        const routine = routineBySlug.get(purchase.itemSlug);
        if (!routine) continue;
        items.push({
          purchaseId: purchase.id,
          paidAt: purchase.paidAt,
          itemType: "lesson",
          routine,
        });
      } else if (purchase.itemType === "external_course") {
        const course = courseBySlug.get(purchase.itemSlug);
        if (!course) continue;
        items.push({
          purchaseId: purchase.id,
          paidAt: purchase.paidAt,
          itemType: "external_course",
          course,
        });
      }
      // `internal_course` purchases can't exist yet — no catalog method
      // backs it, same as favorites (see lib/server/catalog/types.ts).
    }

    return NextResponse.json({
      locale,
      source,
      items,
    });
  } catch (error) {
    return jsonError(error);
  }
}
