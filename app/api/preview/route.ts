import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  PREVIEW_CATALOG_COOKIE,
  PREVIEW_CATALOG_COOKIE_MAX_AGE,
} from "@/lib/preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only allow redirecting back into the app, never off-site. */
function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

/**
 * Shareable link that unlocks the demo/mock catalog (routines, instructors)
 * for testing: `/api/preview?token=<PREVIEW_CATALOG_TOKEN>`. Visit
 * `/api/preview?disable=1` to hide it again. See lib/server/catalog/index.ts
 * for where the cookie is read.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectTo = safeNextPath(searchParams.get("next"));
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  if (searchParams.get("disable") === "1") {
    response.cookies.delete(PREVIEW_CATALOG_COOKIE);
    return response;
  }

  const { env } = await getCloudflareContext({ async: true });
  const expectedToken = env.PREVIEW_CATALOG_TOKEN;
  const providedToken = searchParams.get("token");

  if (expectedToken && providedToken === expectedToken) {
    response.cookies.set(PREVIEW_CATALOG_COOKIE, "1", {
      maxAge: PREVIEW_CATALOG_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
