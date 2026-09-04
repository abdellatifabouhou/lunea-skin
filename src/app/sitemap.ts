import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.domain, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
