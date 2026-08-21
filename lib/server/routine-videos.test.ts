import { describe, expect, it } from "vitest";
import { isExternalRoutineVideoSrc } from "@/lib/server/routine-videos";

describe("isExternalRoutineVideoSrc", () => {
  it("treats http(s) as demo sources and everything else as an R2 key", () => {
    expect(isExternalRoutineVideoSrc("https://cdn.example/sample.mp4")).toBe(
      true,
    );
    expect(isExternalRoutineVideoSrc("http://localhost/x.mp4")).toBe(true);
    expect(
      isExternalRoutineVideoSrc("class-videos/routines/foo.mp4"),
    ).toBe(false);
  });
});
