import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { calculatorHref, getLiveCalculators, getRequiredCalculator } from "../../lib/calculators/catalog.js";
import * as publication from "../../lib/seo/publication.js";
import { primaryNavigation, trustNavigation } from "../../lib/site.js";
import { GET as getFavicon } from "../../app/favicon.ico/route.js";
import { GET as getHealth } from "../../app/healthz/route.js";

const PUBLIC_INDEXABLE = [
  "/",
  "/calculators",
  "/calculators/compound-interest",
  "/calculators/savings-goal",
  "/calculators/how-long-will-my-money-last",
  "/calculators/loan-mortgage-amortization",
  "/calculators/loan-payoff",
  "/methodology",
  "/about",
  "/editorial-policy",
  "/disclaimer",
  "/privacy",
  "/terms",
  "/contact",
] as const;

const EXPECTED_CLASSES = new Map<string, string>([
  ...PUBLIC_INDEXABLE.map((pathname): [string, string] => [pathname, "PUBLIC_INDEXABLE"]),
  ["/calculators/sip-calculator", "PUBLIC_PENDING"],
  ["/_not-found", "TECHNICAL_NOINDEX"],
  ["/_global-error", "TECHNICAL_NOINDEX"],
  ["/healthz", "TECHNICAL_NOINDEX"],
  ["/favicon.ico", "TECHNICAL_NOINDEX"],
  ["/robots.txt", "TECHNICAL_NOINDEX"],
  ["/sitemap.xml", "TECHNICAL_NOINDEX"],
]);

interface RegistryEntry {
  pathname: string;
  title: string;
  userFacing: boolean;
  linkedPublicly: boolean;
  contentComplete: boolean;
  productStatus: string;
  editorialStatus: string;
  mathematicalStatus: string;
  publicationClass: string;
  requiredAction: string;
  evidence: readonly string[];
}

const publicationApi = publication as typeof publication & {
  PUBLICATION_REGISTRY?: readonly RegistryEntry[];
  getDeploymentBlockingRoutes?: () => readonly RegistryEntry[];
};

function discoverAppPageRoutes(root = "app"): string[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name === "page.tsx") files.push(path);
    }
  };
  visit(root);
  return files.map((file) => {
    const directory = relative(root, file.slice(0, -`${sep}page.tsx`.length)).split(sep).join("/");
    return directory ? `/${directory}` : "/";
  }).sort();
}

afterEach(() => vi.unstubAllEnvs());

describe("full public-surface publication registry", () => {
  it("classifies every App Router page and system surface exactly once", () => {
    const registry = publicationApi.PUBLICATION_REGISTRY ?? [];
    expect(new Map(registry.map(({ pathname, publicationClass }) => [pathname, publicationClass]))).toEqual(EXPECTED_CLASSES);
    expect(new Set(registry.map(({ pathname }) => pathname)).size).toBe(registry.length);
    for (const entry of registry) {
      expect(entry).toMatchObject({
        title: expect.any(String),
        userFacing: expect.any(Boolean),
        linkedPublicly: expect.any(Boolean),
        contentComplete: expect.any(Boolean),
        productStatus: expect.not.stringMatching(/^unknown$/i),
        editorialStatus: expect.not.stringMatching(/^unknown$/i),
        mathematicalStatus: expect.not.stringMatching(/^unknown$/i),
        requiredAction: expect.any(String),
        evidence: expect.any(Array),
      });
    }
  });

  it("makes every complete formal public page indexable with unique metadata and a self-canonical", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "public");
    expect(publication.getPublicRoutePathnames()).toEqual(PUBLIC_INDEXABLE);
    const metadata = PUBLIC_INDEXABLE.map((pathname) => publication.createPageMetadata(pathname));
    expect(new Set(metadata.map(({ title }) => String(title))).size).toBe(PUBLIC_INDEXABLE.length);
    expect(new Set(metadata.map(({ description }) => description)).size).toBe(PUBLIC_INDEXABLE.length);
    for (const [index, pathname] of PUBLIC_INDEXABLE.entries()) {
      expect(metadata[index]?.robots).toEqual({ index: true, follow: true });
      expect(metadata[index]?.alternates?.canonical).toBe(`https://clearcashcalc.com${pathname === "/" ? "/" : `${pathname}/`}`);
    }
  });

  it("builds the public sitemap from the same fourteen-page registry projection", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "public");
    expect(publication.buildSitemapEntries().map(({ url }) => url)).toEqual(
      PUBLIC_INDEXABLE.map((pathname) => `https://clearcashcalc.com${pathname === "/" ? "/" : `${pathname}/`}`),
    );
  });

  it("keeps every formal navigation destination inside the indexable registry projection", () => {
    const indexable = new Set(publication.getPublicRoutePathnames());
    const formalLinks = [...primaryNavigation, ...trustNavigation].map(({ href }) => href.replace(/\/$/, ""));
    const calculatorLinks = getLiveCalculators().map(calculatorHref).filter((href): href is string => Boolean(href)).map((href) => href.replace(/\/$/, ""));
    expect([...formalLinks, ...calculatorLinks].filter((pathname) => !indexable.has(pathname))).toEqual([]);
  });

  it("has no publicly linked PUBLIC_PENDING deployment blocker", () => {
    expect(typeof publicationApi.getDeploymentBlockingRoutes).toBe("function");
    expect(publicationApi.getDeploymentBlockingRoutes?.()).toEqual([]);
  });

  it("keeps SIP pending and out of live navigation without deleting its route", () => {
    const sip = getRequiredCalculator("sip-calculator");
    expect(sip).toMatchObject({ availability: "planned", publicListing: true, route: null });
    expect(getLiveCalculators().map(({ slug }) => slug)).not.toContain("sip-calculator");
    expect(existsSync("app/calculators/sip-calculator/page.tsx")).toBe(true);
    expect(publication.getPublicRoutePathnames()).not.toContain("/calculators/sip-calculator");
  });

  it("fails coverage when a user-facing App page is absent from the registry", () => {
    const registry = publicationApi.PUBLICATION_REGISTRY ?? [];
    expect(registry.filter(({ userFacing }) => userFacing).map(({ pathname }) => pathname).sort()).toEqual(discoverAppPageRoutes());
  });

  it("keeps technical routes explicitly noindex in public mode", () => {
    for (const pathname of ["/_not-found", "/_global-error", "/healthz", "/favicon.ico", "/robots.txt", "/sitemap.xml"]) {
      expect(publication.getRobotsMetadata(pathname, "public")).toEqual({ index: false, follow: false });
    }
    expect(getHealth().headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(getFavicon().headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("keeps every user-facing HTML page noindex and canonical-free in prepublic mode", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "prepublic");
    for (const pathname of [...PUBLIC_INDEXABLE, "/calculators/sip-calculator"]) {
      const metadata = publication.createPageMetadata(pathname);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    }
    expect(publication.buildSitemapEntries()).toEqual([]);
  });

  it("keeps advertising and unauthorized third-party script surfaces absent", () => {
    expect(existsSync("public/ads.txt")).toBe(false);
    expect(existsSync("public/robots.txt")).toBe(false);
    expect(existsSync("public/sitemap.xml")).toBe(false);
  });
});
