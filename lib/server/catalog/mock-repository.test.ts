import { describe, expect, it } from "vitest";
import { mockCatalogRepository } from "@/lib/server/catalog/mock-repository";

// Deliberately doesn't hardcode specific demo slugs/styles - the mock catalog
// content is temporary stand-in data (see mock-content rule) and could
// change shape at any time. Every filter assertion below derives its
// expected values from the repository's own unfiltered output instead.

describe("mockCatalogRepository.listRoutines", () => {
  it("returns a non-empty, localized routine list with no filters", async () => {
    const routines = await mockCatalogRepository.listRoutines("en");
    expect(routines.length).toBeGreaterThan(0);
    expect(
      routines.every((routine) => routine.title.length > 0 && routine.slug.length > 0),
    ).toBe(true);
  });

  it("filters strictly by instructor", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { instructorSlug } = all[0];

    const filtered = await mockCatalogRepository.listRoutines("en", {
      instructor: instructorSlug,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((routine) => routine.instructorSlug === instructorSlug)).toBe(
      true,
    );
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });

  it("filters strictly by style", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { style } = all[0];

    const filtered = await mockCatalogRepository.listRoutines("en", { style });

    expect(filtered.every((routine) => routine.style === style)).toBe(true);
  });

  it("filters strictly by level", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { level } = all[0];

    const filtered = await mockCatalogRepository.listRoutines("en", { level });

    expect(filtered.every((routine) => routine.level === level)).toBe(true);
  });

  it("combines multiple filters with AND semantics", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const sample = all[0];

    const filtered = await mockCatalogRepository.listRoutines("en", {
      instructor: sample.instructorSlug,
      style: sample.style,
      level: sample.level,
    });

    expect(filtered.some((routine) => routine.slug === sample.slug)).toBe(true);
    expect(
      filtered.every(
        (routine) =>
          routine.instructorSlug === sample.instructorSlug &&
          routine.style === sample.style &&
          routine.level === sample.level,
      ),
    ).toBe(true);
  });

  it("returns an empty array for a filter that matches nothing", async () => {
    const filtered = await mockCatalogRepository.listRoutines("en", {
      instructor: "definitely-not-a-real-instructor-slug",
    });
    expect(filtered).toEqual([]);
  });

  it("paginates with limit/offset, covering every item exactly once", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const pageSize = 3;
    const pages: string[] = [];

    for (let offset = 0; offset < all.length; offset += pageSize) {
      const page = await mockCatalogRepository.listRoutines("en", undefined, {
        limit: pageSize,
        offset,
      });
      expect(page.length).toBeLessThanOrEqual(pageSize);
      pages.push(...page.map((routine) => routine.slug));
    }

    expect(pages).toEqual(all.map((routine) => routine.slug));
  });

  it("respects filters together with pagination", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { style } = all[0];

    const filteredAll = await mockCatalogRepository.listRoutines("en", { style });
    const firstPage = await mockCatalogRepository.listRoutines(
      "en",
      { style },
      { limit: 1, offset: 0 },
    );

    expect(firstPage.length).toBe(Math.min(1, filteredAll.length));
    expect(firstPage.every((routine) => routine.style === style)).toBe(true);
  });
});

describe("mockCatalogRepository.countRoutines", () => {
  it("matches the length of an unfiltered listRoutines call", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const count = await mockCatalogRepository.countRoutines();
    expect(count).toBe(all.length);
  });

  it("matches the length of a filtered listRoutines call", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { level } = all[0];

    const filtered = await mockCatalogRepository.listRoutines("en", { level });
    const count = await mockCatalogRepository.countRoutines({ level });

    expect(count).toBe(filtered.length);
  });
});

describe("mockCatalogRepository.getRoutine", () => {
  it("returns the routine matching a known slug", async () => {
    const all = await mockCatalogRepository.listRoutines("en");
    const { slug } = all[0];

    const routine = await mockCatalogRepository.getRoutine("en", slug);

    expect(routine?.slug).toBe(slug);
  });

  it("returns null for an unknown slug", async () => {
    const routine = await mockCatalogRepository.getRoutine(
      "en",
      "definitely-not-a-real-slug",
    );
    expect(routine).toBeNull();
  });
});

describe("mockCatalogRepository.listInstructors / getInstructor", () => {
  it("returns instructors with a computed routineCount", async () => {
    const instructors = await mockCatalogRepository.listInstructors("en");
    expect(instructors.length).toBeGreaterThan(0);
    expect(
      instructors.every((instructor) => typeof instructor.routineCount === "number"),
    ).toBe(true);
  });

  it("getInstructor returns null for an unknown slug", async () => {
    const instructor = await mockCatalogRepository.getInstructor(
      "en",
      "definitely-not-a-real-slug",
    );
    expect(instructor).toBeNull();
  });
});

describe("mockCatalogRepository.listExternalCourses", () => {
  it("returns a non-empty, localized external course list", async () => {
    const courses = await mockCatalogRepository.listExternalCourses("en");
    expect(courses.length).toBeGreaterThan(0);
    expect(
      courses.every(
        (course) =>
          course.title.length > 0 &&
          course.slug.length > 0 &&
          course.provider.length > 0 &&
          course.priceDisplay.length > 0,
      ),
    ).toBe(true);
  });

  it("returns locale-specific titles for en vs he", async () => {
    const [en, he] = await Promise.all([
      mockCatalogRepository.listExternalCourses("en"),
      mockCatalogRepository.listExternalCourses("he"),
    ]);

    expect(en.length).toBe(he.length);
    expect(en[0].title).not.toBe(he[0].title);
    expect(en[0].slug).toBe(he[0].slug);
  });
});

describe("mockCatalogRepository.getExternalCourse", () => {
  it("returns the course matching a known slug", async () => {
    const all = await mockCatalogRepository.listExternalCourses("en");
    const { slug } = all[0];

    const course = await mockCatalogRepository.getExternalCourse("en", slug);

    expect(course?.slug).toBe(slug);
  });

  it("returns null for an unknown slug", async () => {
    const course = await mockCatalogRepository.getExternalCourse(
      "en",
      "definitely-not-a-real-slug",
    );
    expect(course).toBeNull();
  });

  it("includes lessons (with localized titles, no r2Key leaked) for a course that has real video content", async () => {
    const all = await mockCatalogRepository.listExternalCourses("en");
    const withLessons = all.find((course) => course.lessons.length > 0);
    expect(withLessons).toBeDefined();
    expect(
      withLessons!.lessons.every(
        (lesson) =>
          lesson.id.length > 0 &&
          lesson.title.length > 0 &&
          !("r2Key" in lesson),
      ),
    ).toBe(true);
  });

  it("returns an empty lessons array for a still-mock 'coming soon' course", async () => {
    const all = await mockCatalogRepository.listExternalCourses("en");
    const withoutLessons = all.find((course) => course.lessons.length === 0);
    expect(withoutLessons).toBeDefined();
  });
});

describe("mockCatalogRepository.getExternalCourseLessonSource", () => {
  it("returns the r2Key for a known course/lesson pair", async () => {
    const all = await mockCatalogRepository.listExternalCourses("en");
    const withLessons = all.find((course) => course.lessons.length > 0);
    expect(withLessons).toBeDefined();
    const lessonId = withLessons!.lessons[0].id;

    const source = await mockCatalogRepository.getExternalCourseLessonSource(
      withLessons!.slug,
      lessonId,
    );
    expect(source?.r2Key.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown lesson id", async () => {
    const source = await mockCatalogRepository.getExternalCourseLessonSource(
      "definitely-not-a-real-slug",
      "definitely-not-a-real-lesson",
    );
    expect(source).toBeNull();
  });
});
