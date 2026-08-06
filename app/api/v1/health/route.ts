import { NextResponse } from "next/server";
import { resolveCatalog } from "@/lib/server/catalog";
import type { CatalogHealthResponse } from "@/lib/server/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { source } = await resolveCatalog();
  const body: CatalogHealthResponse = {
    ok: true,
    service: "the-frame-catalog",
    source,
    now: new Date().toISOString(),
  };

  return NextResponse.json(body);
}
