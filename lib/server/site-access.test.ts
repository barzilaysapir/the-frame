import { describe, expect, it } from "vitest";
import {
  emailInAllowlist,
  parseEmailAllowlist,
} from "@/lib/server/site-access";

describe("parseEmailAllowlist", () => {
  it("splits, trims, lowercases, and drops empties", () => {
    expect(
      parseEmailAllowlist("  Alice@Example.com, bob@x.com ,, ,Carol@Y.COM "),
    ).toEqual(["alice@example.com", "bob@x.com", "carol@y.com"]);
  });

  it("treats missing/blank as empty", () => {
    expect(parseEmailAllowlist(undefined)).toEqual([]);
    expect(parseEmailAllowlist(null)).toEqual([]);
    expect(parseEmailAllowlist("")).toEqual([]);
    expect(parseEmailAllowlist("  ,  ")).toEqual([]);
  });
});

describe("emailInAllowlist", () => {
  const list = ["barzilaysapir@gmail.com", "yahelhayat@gmail.com"];

  it("matches case-insensitively", () => {
    expect(emailInAllowlist("BarzilaySapir@gmail.com", list)).toBe(true);
  });

  it("rejects unknown or missing emails", () => {
    expect(emailInAllowlist("other@gmail.com", list)).toBe(false);
    expect(emailInAllowlist(null, list)).toBe(false);
    expect(emailInAllowlist("a@b.com", [])).toBe(false);
  });
});
