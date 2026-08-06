import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllRoutines } from "@/lib/routines";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/routines", "/instructors", "/about"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    })
  );

  const routineRoutes = getAllRoutines().map((routine) => ({
    url: `${SITE_URL}/routine/${routine.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...routineRoutes];
}
