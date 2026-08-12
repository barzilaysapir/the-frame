import { NextRequest, NextResponse } from "next/server";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import { jsonError } from "@/lib/server/api/auth-context";
import type { CatalogListResponse } from "@/lib/server/catalog/types";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );
    const instructor = request.nextUrl.searchParams.get("instructor") ?? undefined;
    const style = request.nextUrl.searchParams.get("style") ?? undefined;
    const level = request.nextUrl.searchParams.get("level") ?? undefined;

    const { repository, source } = await resolveCatalog();
    const items = await repository.listRoutines(locale, {
      instructor,
      style,
      level,
    });

    const body: CatalogListResponse<CatalogRoutine> = {
      locale,
      source,
      items,
    };

    return NextResponse.json(body);
  } catch (error) {
    return jsonError(error);
  }
}
