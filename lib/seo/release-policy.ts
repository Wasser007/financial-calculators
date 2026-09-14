export type SiteReleaseMode = "prepublic" | "public";

export const PUBLIC_CANONICAL_ORIGIN = "https://clearcashcalc.com";

export function getSiteReleaseMode(value: string | undefined = process.env.SITE_RELEASE_MODE): SiteReleaseMode {
  return value === "public" ? "public" : "prepublic";
}

export function normalizeReleasePathname(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//") || /^[a-z]+:/i.test(value)) return null;
  const pathname = value.split(/[?#]/, 1)[0]!.replace(/\/{2,}/g, "/");
  if (pathname.includes("..")) return null;
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

export function toTrailingSlashPathname(pathname: string): string | null {
  const normalized = normalizeReleasePathname(pathname);
  if (!normalized) return null;
  return normalized === "/" ? "/" : `${normalized}/`;
}
