import { NextRequest, NextResponse } from "next/server";
import {
  getCatalogRepository,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type { CatalogListResponse } from "@/lib/server/catalog/types";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const locale = resolveCatalogLocale(
    request.nextUrl.searchParams.get("locale"),
  );
  const instructor = request.nextUrl.searchParams.get("instructor") ?? undefined;
  const style = request.nextUrl.searchParams.get("style") ?? undefined;
  const level = request.nextUrl.searchParams.get("level") ?? undefined;

  const catalog = getCatalogRepository();
  let items = await catalog.listRoutines(locale);

  if (instructor) {
    items = items.filter((item) => item.instructorSlug === instructor);
  }
  if (style) {
    items = items.filter((item) => item.style === style);
  }
  if (level) {
    items = items.filter((item) => item.level === level);
  }

  const body: CatalogListResponse<CatalogRoutine> = {
    locale,
    source: "mock",
    items,
  };

  return NextResponse.json(body);
}
