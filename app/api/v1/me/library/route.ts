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
  listPaidPurchases,
  upsertUserFromClaims,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface LibraryItem {
  purchaseId: string;
  paidAt: string | null;
  routine: CatalogRoutine;
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
    const [purchases, { repository, source }] = await Promise.all([
      listPaidPurchases(db, claims.uid),
      resolveCatalog(),
    ]);

    // Fetch the full catalog once (batched internally) rather than issuing
    // getRoutine() per purchase — avoids N+1 queries when a user's library
    // grows to many routines.
    const allRoutines = await repository.listRoutines(locale);
    const routineBySlug = new Map(
      allRoutines.map((routine) => [routine.slug, routine]),
    );

    const items: LibraryItem[] = [];
    for (const purchase of purchases) {
      const routine = routineBySlug.get(purchase.routineSlug);
      if (!routine) continue;
      items.push({
        purchaseId: purchase.id,
        paidAt: purchase.paidAt,
        routine,
      });
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
