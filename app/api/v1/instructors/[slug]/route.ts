import { NextRequest, NextResponse } from "next/server";
import {
  getCatalogRepository,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import type {
  CatalogInstructor,
  CatalogItemResponse,
} from "@/lib/server/catalog/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const locale = resolveCatalogLocale(
    request.nextUrl.searchParams.get("locale"),
  );

  const item = await getCatalogRepository().getInstructor(locale, slug);
  if (!item) {
    return NextResponse.json(
      { error: "Instructor not found", slug, locale },
      { status: 404 },
    );
  }

  const body: CatalogItemResponse<CatalogInstructor> = {
    locale,
    source: "mock",
    item,
  };

  return NextResponse.json(body);
}
