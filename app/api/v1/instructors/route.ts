import { NextRequest, NextResponse } from "next/server";
import {
  getCatalogRepository,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type {
  CatalogInstructor,
  CatalogListResponse,
} from "@/lib/server/catalog/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const locale = resolveCatalogLocale(
    request.nextUrl.searchParams.get("locale"),
  );
  const items = await getCatalogRepository().listInstructors(locale);

  const body: CatalogListResponse<CatalogInstructor> = {
    locale,
    source: "mock",
    items,
  };

  return NextResponse.json(body);
}
