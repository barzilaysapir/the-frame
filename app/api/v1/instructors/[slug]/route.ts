import { NextRequest, NextResponse } from "next/server";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import { jsonError } from "@/lib/server/api/auth-context";
import type {
  CatalogInstructor,
  CatalogItemResponse,
} from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const locale = resolveCatalogLocale(
      request.nextUrl.searchParams.get("locale"),
    );

    const { repository, source } = await resolveCatalog();
    const item = await repository.getInstructor(locale, slug);
    if (!item) {
      return NextResponse.json(
        { error: "Instructor not found", slug, locale },
        { status: 404 },
      );
    }

    const body: CatalogItemResponse<CatalogInstructor> = {
      locale,
      source,
      item,
    };

    return NextResponse.json(body);
  } catch (error) {
    return jsonError(error);
  }
}
