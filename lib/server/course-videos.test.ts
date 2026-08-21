import { describe, expect, it } from "vitest";
import {
  applyR2VideoContentType,
  describeR2VideoRange,
  parseRangeHeader,
} from "@/lib/server/course-videos";

describe("parseRangeHeader", () => {
  it("parses a closed range", () => {
    expect(parseRangeHeader("bytes=0-1")).toEqual({ offset: 0, length: 2 });
  });

  it("parses an open-ended range", () => {
    expect(parseRangeHeader("bytes=100-")).toEqual({ offset: 100 });
  });

  it("parses a suffix range", () => {
    expect(parseRangeHeader("bytes=-500")).toEqual({ suffix: 500 });
  });
});

describe("describeR2VideoRange", () => {
  it("uses the request when R2 does not echo a range (Safari 0-1 probe)", () => {
    expect(
      describeR2VideoRange({ offset: 0, length: 2 }, 1_000_000),
    ).toEqual({ start: 0, end: 1, length: 2 });
  });

  it("returns the rest of the file for an open-ended range", () => {
    expect(describeR2VideoRange({ offset: 100 }, 250)).toEqual({
      start: 100,
      end: 249,
      length: 150,
    });
  });

  it("prefers the echoed R2 range when present", () => {
    expect(
      describeR2VideoRange({ offset: 0, length: 2 }, 1000, {
        offset: 0,
        length: 2,
      }),
    ).toEqual({ start: 0, end: 1, length: 2 });
  });

  it("returns null when the start is past EOF", () => {
    expect(describeR2VideoRange({ offset: 500 }, 100)).toBeNull();
  });
});

describe("applyR2VideoContentType", () => {
  it("forces video/mp4 when the object has no type or octet-stream", () => {
    const missing = new Headers();
    applyR2VideoContentType(missing);
    expect(missing.get("content-type")).toBe("video/mp4");

    const octet = new Headers({ "content-type": "application/octet-stream" });
    applyR2VideoContentType(octet);
    expect(octet.get("content-type")).toBe("video/mp4");
  });
});
