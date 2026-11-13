import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/top", "/terms", "/privacy", "/refund", "/login"], disallow: ["/admin", "/api", "/account", "/dashboard", "/saved", "/welcome"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
