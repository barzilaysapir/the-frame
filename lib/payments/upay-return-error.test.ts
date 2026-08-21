import { describe, expect, it } from "vitest";
import {
  repairUpayMojibake,
  upayReturnErrorMessage,
} from "@/lib/payments/upay-return-error";

describe("repairUpayMojibake", () => {
  it("restores Hebrew that uPay double-encoded as Latin-1", () => {
    const mojibake = Buffer.from("המשתמש לא קיים", "utf8").toString("latin1");
    expect(repairUpayMojibake(mojibake)).toBe("המשתמש לא קיים");
  });
});

describe("upayReturnErrorMessage", () => {
  const copy = {
    userNotExists: "merchant missing",
    paymentNotCompleted: "try again",
  };

  it("maps USER_NOT_EXISTS", () => {
    expect(upayReturnErrorMessage("USER_NOT_EXISTS", null, copy)).toBe(
      "merchant missing",
    );
  });

  it("returns null when uPay sent no error", () => {
    expect(upayReturnErrorMessage(null, null, copy)).toBeNull();
  });
});
