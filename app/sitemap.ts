import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarshipmn.academy";
  const now = new Date();
  const staticRoutes = [
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

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const adminDb = getAdminDb();
  if (!adminDb) {
    return staticEntries;
  }

  try {
    const snapshot = await adminDb.collection("scholarships").get();
    const scholarshipEntries: MetadataRoute.Sitemap = snapshot.docs.map((doc) => ({
      url: `${siteUrl}/scholarships/${doc.id}`,
      lastModified: doc.updateTime.toDate(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...scholarshipEntries];
  } catch (error) {
    console.error("Sitemap scholarships fetch error:", error);
    return staticEntries;
  }
}
