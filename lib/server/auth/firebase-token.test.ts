import { describe, expect, it } from "vitest";
import { getBearerToken } from "@/lib/server/auth/firebase-token";

describe("getBearerToken", () => {
  it("extracts the token from a well-formed Authorization header", () => {
    const request = new Request("http://localhost/api/test", {
      headers: { authorization: "Bearer abc123" },
    });
    expect(getBearerToken(request)).toBe("abc123");
  });

  it("returns null when there is no Authorization header", () => {
    const request = new Request("http://localhost/api/test");
    expect(getBearerToken(request)).toBeNull();
  });

  it("returns null for a non-Bearer auth scheme", () => {
    const request = new Request("http://localhost/api/test", {
      headers: { authorization: "Basic abc123" },
    });
    expect(getBearerToken(request)).toBeNull();
  });

  it("returns null for a Bearer header with no token", () => {
    const request = new Request("http://localhost/api/test", {
      headers: { authorization: "Bearer " },
    });
    expect(getBearerToken(request)).toBeNull();
  });
});
