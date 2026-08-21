import { describe, expect, it } from "vitest";
import { toIsraeliE164, toIsraeliMobileNational } from "@/lib/phone";

describe("toIsraeliMobileNational", () => {
  it("accepts common Israeli mobile writings", () => {
    expect(toIsraeliMobileNational("050-1234567")).toBe("0501234567");
    expect(toIsraeliMobileNational("0501234567")).toBe("0501234567");
    expect(toIsraeliMobileNational("+972501234567")).toBe("0501234567");
    expect(toIsraeliMobileNational("972501234567")).toBe("0501234567");
    expect(toIsraeliMobileNational("501234567")).toBe("0501234567");
  });

  it("rejects landlines and junk", () => {
    expect(toIsraeliMobileNational("09-1234567")).toBeNull();
    expect(toIsraeliMobileNational("123")).toBeNull();
    expect(toIsraeliMobileNational("")).toBeNull();
  });
});

describe("toIsraeliE164", () => {
  it("normalizes a local mobile number", () => {
    expect(toIsraeliE164("050-1234567")).toBe("+972501234567");
  });
});
