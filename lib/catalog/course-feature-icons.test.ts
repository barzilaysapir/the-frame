import { describe, expect, it } from "vitest";
import { isCourseFeatureIcon } from "@/lib/catalog/course-feature-icons";

describe("isCourseFeatureIcon", () => {
  it("accepts keys the grid can render", () => {
    expect(isCourseFeatureIcon("heart")).toBe(true);
    expect(isCourseFeatureIcon("sparkles")).toBe(true);
  });

  it("rejects keys that would render as undefined", () => {
    expect(isCourseFeatureIcon("music-note")).toBe(false);
    expect(isCourseFeatureIcon("")).toBe(false);
  });
});
