import type { MetadataRoute } from "next";
import { PUBLIC_CANONICAL_ORIGIN, getSiteReleaseMode } from "../lib/seo/release-policy.js";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const sitemap = getSiteReleaseMode() === "public" ? `${PUBLIC_CANONICAL_ORIGIN}/sitemap.xml` : undefined;
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(sitemap ? { sitemap } : {}),
  };
}
