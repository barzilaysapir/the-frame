import { NextRequest, NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  jsonError,
  readJsonBody,
  requireAppDb,
  requireFirebaseClaims,
} from "@/lib/server/api/auth-context";
import {
  updateUserProfile,
  upsertUserFromClaims,
  type AppUser,
} from "@/lib/server/users/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeUser(user: AppUser) {
  return {
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    localePref: user.localePref,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    const localeParam = request.nextUrl.searchParams.get("locale");
    const localePref: Locale | undefined =
      localeParam && isLocale(localeParam) ? localeParam : undefined;
    const user = await upsertUserFromClaims(db, claims, localePref);
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const claims = await requireFirebaseClaims(request);
    const db = await requireAppDb();
    // Ensure the row exists before patching (first-login race).
    await upsertUserFromClaims(db, claims);

    const body = await readJsonBody<{
      displayName?: unknown;
      localePref?: unknown;
    }>(request);

    const patch: { displayName?: string; localePref?: Locale } = {};
    if (typeof body.displayName === "string") {
      const trimmed = body.displayName.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "displayName must not be empty" },
          { status: 400 },
        );
      }
      patch.displayName = trimmed;
    }
    if (typeof body.localePref === "string" && isLocale(body.localePref)) {
      patch.localePref = body.localePref;
    }

    if (patch.displayName === undefined && patch.localePref === undefined) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const user = await updateUserProfile(db, claims.uid, patch);
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    return jsonError(error);
  }
}
