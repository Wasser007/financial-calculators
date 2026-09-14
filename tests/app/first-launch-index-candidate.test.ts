import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { calculatorHref, getLiveCalculators } from "../../lib/calculators/catalog.js";
import { primaryNavigation } from "../../lib/site.js";
import {
  buildCanonical,
  buildSitemapEntries,
  createPageMetadata,
  getPublicRoutePathnames,
  getRobotsMetadata,
  type PublicationConfig,
} from "../../lib/seo/publication.js";

const FULL_PUBLIC_PATHS = [
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

const ready: PublicationConfig = {
  approvedPublicName: "ClearCash Calc",
  legalOperator: "Example Operator Ltd",
  canonicalOrigin: "https://clearcashcalc.com",
  publicationStatus: "ready-for-publication",
  policyApprovals: { privacy: true, terms: true, disclaimer: true },
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("full public-surface release policy", () => {
  it("fails closed for an unset, empty, or invalid release mode", () => {
    for (const value of [undefined, "", "PUBLIC", "preview"]) {
      if (value === undefined) vi.stubEnv("SITE_RELEASE_MODE", undefined);
      else vi.stubEnv("SITE_RELEASE_MODE", value);
      expect(createPageMetadata("/").robots).toEqual({ index: false, follow: false });
      expect(createPageMetadata("/").alternates).toBeUndefined();
    }
  });

  it("makes every registered complete public page indexable in public mode", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "public");
    expect(getPublicRoutePathnames()).toEqual(FULL_PUBLIC_PATHS);
    for (const pathname of FULL_PUBLIC_PATHS) {
      const metadata = createPageMetadata(pathname);
      expect(metadata.robots).toEqual({ index: true, follow: true });
      expect(metadata.alternates?.canonical).toBe(`https://clearcashcalc.com${pathname === "/" ? "/" : `${pathname}/`}`);
    }
    expect(createPageMetadata("/calculators/sip-calculator").robots).toEqual({ index: false, follow: false });
  });

  it("gives all public candidates unique titles and descriptions", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "public");
    const metadata = FULL_PUBLIC_PATHS.map((pathname) => createPageMetadata(pathname));
    const titles = metadata.map(({ title }) => String(title));
    const descriptions = metadata.map(({ description }) => description);
    expect(new Set(titles).size).toBe(FULL_PUBLIC_PATHS.length);
    expect(new Set(descriptions).size).toBe(FULL_PUBLIC_PATHS.length);
    expect(descriptions.every((description) => typeof description === "string" && description.trim().length > 0)).toBe(true);
    expect(titles.slice(1).every((title) => !title.includes("ClearCash Calc"))).toBe(true);
  });

  it("uses one trailing-slash canonical form and an exact full-public sitemap", () => {
    expect(buildCanonical("/calculators/compound-interest?amount=1000#result", ready)).toBe(
      "https://clearcashcalc.com/calculators/compound-interest/",
    );
    vi.stubEnv("SITE_RELEASE_MODE", "public");
    expect(buildSitemapEntries().map(({ url }) => url)).toEqual(
      FULL_PUBLIC_PATHS.map((pathname) => `https://clearcashcalc.com${pathname === "/" ? "/" : `${pathname}/`}`),
    );
  });

  it("keeps robots crawlable in both modes and advertises the sitemap only in public mode", () => {
    vi.stubEnv("SITE_RELEASE_MODE", "prepublic");
    expect(getRobotsMetadata()).toEqual({ index: false, follow: false });
    expect(existsSync("app/robots.ts")).toBe(true);
    expect(existsSync("app/sitemap.ts")).toBe(true);
    expect(existsSync("public/robots.txt")).toBe(false);
    expect(existsSync("public/sitemap.xml")).toBe(false);
  });

  it("uses trailing-slash destinations for generated calculator and primary-navigation links", () => {
    expect(getLiveCalculators().map(calculatorHref).filter(Boolean).every((href) => href!.endsWith("/"))).toBe(true);
    expect(primaryNavigation.every(({ href }) => href.endsWith("/"))).toBe(true);
  });
});

describe("third-party script reconciliation", () => {
  it("does not ship an advertising script or ads.txt while advertising is disabled", () => {
    const layoutSource = readFileSync("app/layout.tsx", "utf8");
    expect(layoutSource).not.toMatch(/pagead2|googlesyndication|adsbygoogle|next\/script/i);
    expect(existsSync("public/ads.txt")).toBe(false);
  });
});
