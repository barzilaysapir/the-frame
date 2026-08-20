import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireAppDb } from "@/lib/server/api/auth-context";
import {
  fulfillByUniqId,
  getPurchaseForIpn,
  getTakbullConfig,
  parseTakbullIpn,
} from "@/lib/server/payments/takbull";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Takbull IPN. The payload itself is not a signature — we always re-check
 * the charge with `ValidateNotification` (API key + secret) before marking
 * a purchase paid. Unknown/unpaid callbacks still return 200 so Takbull
 * does not retry forever; DB errors return 500 so they do retry.
 */
export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

async function readIpnSource(request: NextRequest): Promise<Record<string, unknown>> {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  if (request.method === "GET") return query;

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as unknown;
      return json && typeof json === "object" && !Array.isArray(json)
        ? { ...query, ...(json as Record<string, unknown>) }
        : query;
    }
    if (contentType.includes("form") || request.method === "POST") {
      const form = await request.formData();
      return { ...query, ...Object.fromEntries(form.entries()) };
    }
  } catch {
    // Empty or unreadable body — query params may still have the ids.
  }
  return query;
}

async function handle(request: NextRequest) {
  try {
    const source = await readIpnSource(request);
    const parsed = parseTakbullIpn(source);
    console.log("[webhooks/takbull] callback received", parsed);

    const config = await getTakbullConfig();
    if (!config) {
      console.error("[webhooks/takbull] Takbull is not configured");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const db = await requireAppDb();
    const purchase = await getPurchaseForIpn(db, parsed);
    if (!purchase) {
      console.error("[webhooks/takbull] no purchase for callback", parsed);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const uniqId = parsed.uniqId || purchase.providerProcessId;
    if (!uniqId) {
      console.error(`[webhooks/takbull] purchase ${purchase.id} has no uniqId`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const status = await fulfillByUniqId(db, config, purchase, uniqId);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return jsonError(error);
  }
}
