import "server-only";
import { NextResponse } from "next/server";
import {
  remainingPlaybackTtlSeconds,
  tryPresignR2Get,
} from "@/lib/server/r2-presign";

const R2_API_NOT_CONFIGURED = "r2_api_not_configured";

/** 307 to a presigned GET — never copy object bytes (Worker 1102). */
export async function redirectToPresignedR2(
  objectKey: string,
  expRaw: string | null,
): Promise<NextResponse> {
  const presigned = await tryPresignR2Get(
    objectKey,
    remainingPlaybackTtlSeconds(expRaw),
  );
  if (!presigned) {
    return NextResponse.json(
      {
        error: "R2 API token is not configured on this Worker",
        code: R2_API_NOT_CONFIGURED,
      },
      { status: 503 },
    );
  }
  const response = NextResponse.redirect(presigned, 307);
  response.headers.set("Cache-Control", "private, max-age=0, no-store");
  return response;
}
