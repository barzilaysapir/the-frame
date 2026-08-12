import { describe, expect, it, vi } from "vitest";
import { ApiError, jsonError, readJsonBody } from "@/lib/server/api/auth-context";

describe("ApiError", () => {
  it("carries a status and message like a normal Error", () => {
    const error = new ApiError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("readJsonBody", () => {
  it("parses a valid JSON body", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ hello: "world" }),
    });
    const body = await readJsonBody<{ hello: string }>(request);
    expect(body).toEqual({ hello: "world" });
  });

  it("throws a 400 ApiError for malformed JSON instead of a raw parse error", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{not valid json",
    });
    await expect(readJsonBody(request)).rejects.toMatchObject({
      status: 400,
      message: "Invalid JSON body",
    });
  });
});

describe("jsonError", () => {
  it("maps an ApiError to its own status and message", async () => {
    const response = jsonError(new ApiError(403, "Forbidden"));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("maps unknown errors to a generic 500 without leaking details", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = jsonError(new Error("some internal detail"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal server error",
    });
    consoleSpy.mockRestore();
  });
});
