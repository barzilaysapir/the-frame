import { NextResponse } from "next/server";
import {
  getBearerToken,
  verifyFirebaseIdToken,
  type FirebaseIdTokenClaims,
} from "@/lib/server/auth/firebase-token";
import { getAppDb, type AppDb } from "@/lib/server/db";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireAppDb(): Promise<AppDb> {
  const db = await getAppDb();
  if (!db) {
    throw new ApiError(503, "App database unavailable");
  }
  return db;
}

export async function requireFirebaseClaims(
  request: Request,
): Promise<FirebaseIdTokenClaims> {
  const token = getBearerToken(request);
  if (!token) {
    throw new ApiError(401, "Missing Authorization Bearer token");
  }
  try {
    return await verifyFirebaseIdToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired Firebase ID token");
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
