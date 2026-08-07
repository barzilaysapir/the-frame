import { NextRequest, NextResponse } from "next/server";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type {
  CatalogInstructor,
  CatalogListResponse,
} from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const locale = resolveCatalogLocale(
    request.nextUrl.searchParams.get("locale"),
  );
  const { repository, source } = await resolveCatalog();
  const items = await repository.listInstructors(locale);

  const body: CatalogListResponse<CatalogInstructor> = {
    locale,
    source,
    items,
  };

  return NextResponse.json(body);
}
