import { NextRequest, NextResponse } from "next/server";
import {
  resolveCatalog,
  resolveCatalogLocale,
} from "@/lib/server/catalog";
import { jsonError } from "@/lib/server/api/auth-context";
import type {
  CatalogListResponse,
  CatalogPaginatedListResponse,
  CatalogRoutine,
} from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

function parsePositiveInt(
  value: string | null,
  fallback: number,
  max: number,
): number {
  const parsed = value === null ? NaN : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const locale = resolveCatalogLocale(params.get("locale"));
    const instructor = params.get("instructor") ?? undefined;
    const style = params.get("style") ?? undefined;
    const level = params.get("level") ?? undefined;
    const filters = { instructor, style, level };

    const { repository, source } = await resolveCatalog();

    // `limit` opts the request into pagination (used by the library's
    // infinite scroll); omitting it keeps the original "return everything"
    // behavior for existing callers (e.g. the styles page, /me/library).
    const hasPagination = params.has("limit");
    if (!hasPagination) {
      const items = await repository.listRoutines(locale, filters);
      const body: CatalogListResponse<CatalogRoutine> = {
        locale,
        source,
        items,
      };
      return NextResponse.json(body);
    }

    const limit = parsePositiveInt(
      params.get("limit"),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );
    const offset = parsePositiveInt(params.get("offset"), 0, Number.MAX_SAFE_INTEGER);

    const [items, total] = await Promise.all([
      repository.listRoutines(locale, filters, { limit, offset }),
      repository.countRoutines(filters),
    ]);

    const body: CatalogPaginatedListResponse<CatalogRoutine> = {
      locale,
      source,
      items,
      total,
      hasMore: offset + items.length < total,
    };
    return NextResponse.json(body);
  } catch (error) {
    return jsonError(error);
  }
}
