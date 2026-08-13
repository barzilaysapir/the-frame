import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllRoutines } from "@/lib/routines";
import { locales } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/routines",
    "/instructors",
    "/styles",
    "/external-courses",
    "/about",
  ];

  const staticRoutes = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}${localePath(locale, path === "/" ? "/" : path)}`,
      lastModified: new Date(),
    })),
  );

  const routineRoutes = locales.flatMap((locale) =>
    getAllRoutines().map((routine) => ({
      url: `${SITE_URL}${localePath(locale, `/routine/${routine.slug}`)}`,
      lastModified: new Date(),
    })),
  );

  return [...staticRoutes, ...routineRoutes];
}
