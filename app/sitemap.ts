import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarshipmn.academy";
  const now = new Date();
  const routes = [
    "",
    "/about",
    "/courses",
    "/forum",
    "/privacy",
    "/scholarships",
    "/terms",
    "/auth/login",
    "/auth/register",
    "/partners/register",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
