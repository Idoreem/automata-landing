import type { MetadataRoute } from "next";
import { BASE_PATH, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: `${BASE_PATH}/`,
        disallow: [`${BASE_PATH}/thanks`, `${BASE_PATH}/api/`],
      },
    ],
    sitemap: `${SITE_URL}${BASE_PATH}/sitemap.xml`,
  };
}
