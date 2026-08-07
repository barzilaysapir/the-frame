import type { User } from "firebase/auth";

/** Authenticated fetch using the current Firebase ID token. */
export async function fetchWithAuth(
  user: User,
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
