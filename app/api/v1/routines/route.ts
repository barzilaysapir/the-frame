import { NextRequest, NextResponse } from "next/server";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type { CatalogListResponse } from "@/lib/server/catalog/types";
import type { CatalogRoutine } from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const locale = resolveCatalogLocale(
    request.nextUrl.searchParams.get("locale"),
  );
  const instructor = request.nextUrl.searchParams.get("instructor") ?? undefined;
  const style = request.nextUrl.searchParams.get("style") ?? undefined;
  const level = request.nextUrl.searchParams.get("level") ?? undefined;

  const { repository, source } = await resolveCatalog();
  let items = await repository.listRoutines(locale);

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
    source,
    items,
  };

  return NextResponse.json(body);
}
