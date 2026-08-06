import { NextResponse } from "next/server";
import type { CatalogHealthResponse } from "@/lib/server/catalog/types";

export const runtime = "nodejs";

export async function GET() {
  const body: CatalogHealthResponse = {
    ok: true,
    service: "the-frame-catalog",
    source: "mock",
    now: new Date().toISOString(),
  };

  return NextResponse.json(body);
}
