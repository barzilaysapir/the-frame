import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export interface FirebaseIdTokenClaims {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  raw: JWTPayload;
}

function getFirebaseProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured");
  }
  return projectId;
}

/**
 * Verify a Firebase ID token (Workers-friendly JWT check via Google JWKS).
 * No Firebase Admin SDK / service account required for verification.
 */
export async function verifyFirebaseIdToken(
  token: string,
): Promise<FirebaseIdTokenClaims> {
  const projectId = getFirebaseProjectId();
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : null;
  if (!uid) {
    throw new Error("Firebase ID token is missing subject");
  }

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
    raw: payload,
  };
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}
