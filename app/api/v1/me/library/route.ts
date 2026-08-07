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
    await upsertUserFromClaims(db, claims);

    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    const purchases = await listPaidPurchases(db, claims.uid);
    const { repository, source } = await resolveCatalog();

    const items: LibraryItem[] = [];
    for (const purchase of purchases) {
      const routine = await repository.getRoutine(
        locale,
        purchase.routineSlug,
      );
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
