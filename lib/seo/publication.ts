import type { Metadata } from "next";
import { SITE, type PublicationStatus } from "../site.js";
import {
  PUBLIC_CANONICAL_ORIGIN,
  getSiteReleaseMode,
  normalizeReleasePathname,
  toTrailingSlashPathname,
  type SiteReleaseMode,
} from "./release-policy.js";

export interface PublicationConfig {
  approvedPublicName: string | null;
  legalOperator: string | null;
  canonicalOrigin: string | null;
  publicationStatus: PublicationStatus;
  policyApprovals: { privacy: boolean; terms: boolean; disclaimer: boolean };
}

export interface PageDefinition { pathname: string; title: string; description: string; h1: string }

export const STATIC_PUBLIC_PAGES = [
  { pathname: "/", title: "Transparent financial calculators", description: "Explore financial calculators with visible assumptions, methods, limitations, and privacy boundaries.", h1: "Plan with numbers you can understand." },
  { pathname: "/calculators", title: "Financial calculators", description: "Browse available financial calculators and clearly identified tools planned for later.", h1: "Financial calculators" },
  { pathname: "/methodology", title: "Calculation methodology", description: "Learn how calculator scenarios handle returns, contributions, fees, inflation, precision, and display.", h1: "Methodology" },
  { pathname: "/about", title: "About this financial tools project", description: "Learn the purpose, audience, identity status, and publishing standards behind this financial tools project.", h1: `About ${SITE.name}` },
  { pathname: "/editorial-policy", title: "Editorial policy", description: "Read the current authorship, review, evidence, correction, and update standards for this pre-launch financial tools project.", h1: "Editorial policy" },
  { pathname: "/contact", title: "Contact and feedback status", description: "See the current contact and feedback-channel status for this pre-launch financial tools project.", h1: "Contact" },
  { pathname: "/privacy", title: "Privacy notice", description: "Learn how the current calculator handles inputs and what data-processing features are not present.", h1: "Privacy" },
  { pathname: "/terms", title: "Website terms", description: "Read the current terms for using this pre-launch website and its educational financial calculators.", h1: "Terms" },
  { pathname: "/disclaimer", title: "Financial calculator disclaimer", description: "Understand the no-advice boundary and limitations of the calculators and educational content.", h1: "Disclaimer" },
] as const satisfies readonly PageDefinition[];

export const COMPOUND_INTEREST_PAGE: PageDefinition = {
  pathname: "/calculators/compound-interest",
  title: "Compound Interest Calculator with Contributions, Fees & Inflation",
  description: "Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.",
  h1: "Compound Interest Calculator",
};

export const LOAN_MORTGAGE_PAGE: PageDefinition = {
  pathname: "/calculators/loan-mortgage-amortization",
  title: "Loan & Mortgage Amortization Calculator",
  description: "Calculate monthly payments, total interest costs, and schedule payoffs for fixed payment and equal principal loans.",
  h1: "Loan & Mortgage Amortization Calculator",
};

export const MONEY_DURATION_PAGE: PageDefinition = {
  pathname: "/calculators/how-long-will-my-money-last",
  title: "How Long Will My Money Last? - Longevity Calculator",
  description: "Estimate how long savings may sustain recurring withdrawals under selected return, inflation, and withdrawal-timing assumptions.",
  h1: "How Long Will My Money Last?",
};

export const LOAN_PAYOFF_PAGE: PageDefinition = {
  pathname: "/calculators/loan-payoff",
  title: "Loan Payoff Calculator - Early Debt Payoff & Interest Savings",
  description: "Estimate how extra monthly payments may shorten a loan payoff timeline and reduce total interest under the selected assumptions.",
  h1: "Loan Payoff Calculator",
};

export const SIP_CALCULATOR_PAGE: PageDefinition = {
  pathname: "/calculators/sip-calculator",
  title: "SIP / DCA Calculator - Systematically Build Long-Term Wealth",
  description: "Calculate expected wealth growth and compounding returns from disciplined periodic monthly contributions.",
  h1: "SIP / DCA Calculator",
};

export const SAVINGS_GOAL_PAGE: PageDefinition = {
  pathname: "/calculators/savings-goal",
  title: "Savings Goal Calculator - Plan Your Periodic Contributions",
  description: "Calculate the exact monthly or periodic contribution needed to reach your savings goal based on timeline, return rate, and initial capital.",
  h1: "Savings Goal Calculator",
};

export type PublicationClass = "PUBLIC_INDEXABLE" | "PUBLIC_PENDING" | "TECHNICAL_NOINDEX" | "REDIRECT_ONLY";

export interface PublicationRegistryEntry extends PageDefinition {
  userFacing: boolean;
  linkedPublicly: boolean;
  contentComplete: boolean;
  productStatus: "live" | "planned" | "technical" | "redirect";
  editorialStatus: "review-pending" | "not-applicable";
  mathematicalStatus: "verified" | "evidence-incomplete" | "not-applicable";
  publicationClass: PublicationClass;
  requiredAction: "keep" | "hide-until-accepted" | "technical-exclusion" | "redirect";
  evidence: readonly string[];
}

function requireStaticPage(pathname: string): PageDefinition {
  const page = STATIC_PUBLIC_PAGES.find((entry) => entry.pathname === pathname);
  if (!page) throw new Error(`Missing static page definition for ${pathname}`);
  return page;
}

function indexablePage(
  page: PageDefinition,
  evidence: readonly string[],
  mathematicalStatus: PublicationRegistryEntry["mathematicalStatus"] = "not-applicable",
): PublicationRegistryEntry {
  return {
    ...page,
    userFacing: true,
    linkedPublicly: true,
    contentComplete: true,
    productStatus: "live",
    editorialStatus: "review-pending",
    mathematicalStatus,
    publicationClass: "PUBLIC_INDEXABLE",
    requiredAction: "keep",
    evidence,
  };
}

function technicalPage(pathname: string, title: string, evidence: readonly string[]): PublicationRegistryEntry {
  return {
    pathname,
    title,
    description: `${title} is a non-content system surface and is excluded from search indexing.`,
    h1: title,
    userFacing: false,
    linkedPublicly: false,
    contentComplete: true,
    productStatus: "technical",
    editorialStatus: "not-applicable",
    mathematicalStatus: "not-applicable",
    publicationClass: "TECHNICAL_NOINDEX",
    requiredAction: "technical-exclusion",
    evidence,
  };
}

export const PUBLICATION_REGISTRY = [
  indexablePage(requireStaticPage("/"), ["app/page.tsx", "components/site-header.tsx"]),
  indexablePage(requireStaticPage("/calculators"), ["app/calculators/page.tsx", "lib/calculators/catalog.ts"]),
  indexablePage(COMPOUND_INTEREST_PAGE, ["app/calculators/compound-interest/page.tsx", "tests/calculator"], "verified"),
  indexablePage(SAVINGS_GOAL_PAGE, ["app/calculators/savings-goal/page.tsx", "tests/calculator"], "verified"),
  indexablePage(MONEY_DURATION_PAGE, ["app/calculators/how-long-will-my-money-last/page.tsx", "tests/calculator"], "verified"),
  indexablePage(LOAN_MORTGAGE_PAGE, ["app/calculators/loan-mortgage-amortization/page.tsx", "tests/calculator"], "verified"),
  indexablePage(LOAN_PAYOFF_PAGE, ["app/calculators/loan-payoff/page.tsx", "tests/calculator"], "verified"),
  indexablePage(requireStaticPage("/methodology"), ["app/methodology/page.tsx", "components/site-header.tsx"]),
  indexablePage(requireStaticPage("/about"), ["app/about/page.tsx", "components/site-header.tsx"]),
  indexablePage(requireStaticPage("/editorial-policy"), ["app/editorial-policy/page.tsx", "components/site-footer.tsx"]),
  indexablePage(requireStaticPage("/disclaimer"), ["app/disclaimer/page.tsx", "components/site-footer.tsx"]),
  indexablePage(requireStaticPage("/privacy"), ["app/privacy/page.tsx", "components/site-footer.tsx"]),
  indexablePage(requireStaticPage("/terms"), ["app/terms/page.tsx", "components/site-footer.tsx"]),
  indexablePage(requireStaticPage("/contact"), ["app/contact/page.tsx", "components/site-footer.tsx"]),
  {
    ...SIP_CALCULATOR_PAGE,
    userFacing: true,
    linkedPublicly: false,
    contentComplete: false,
    productStatus: "planned",
    editorialStatus: "review-pending",
    mathematicalStatus: "evidence-incomplete",
    publicationClass: "PUBLIC_PENDING",
    requiredAction: "hide-until-accepted",
    evidence: ["app/calculators/sip-calculator/page.tsx", "tests/app/sip-calculator-page.test.tsx"],
  },
  technicalPage("/_not-found", "Not found response", ["app/not-found.tsx", "out/404.html"]),
  technicalPage("/_global-error", "Global error response", ["app/error.tsx", ".next/server/app-paths-manifest.json"]),
  technicalPage("/healthz", "Health status response", ["app/healthz/route.ts"]),
  technicalPage("/favicon.ico", "Favicon resource", ["app/favicon.ico/route.ts"]),
  technicalPage("/robots.txt", "Robots policy resource", ["app/robots.ts"]),
  technicalPage("/sitemap.xml", "Sitemap resource", ["app/sitemap.ts"]),
] as const satisfies readonly PublicationRegistryEntry[];

export function getPublicationRecord(pathname: string): PublicationRegistryEntry | undefined {
  const normalized = normalizeReleasePathname(pathname);
  return normalized ? PUBLICATION_REGISTRY.find((entry) => entry.pathname === normalized) : undefined;
}

export function getDeploymentBlockingRoutes(): readonly PublicationRegistryEntry[] {
  return PUBLICATION_REGISTRY.filter((entry) => entry.userFacing && entry.linkedPublicly && entry.publicationClass === "PUBLIC_PENDING");
}


function approvedHttpsOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) return null;
    return url.origin;
  } catch { return null; }
}

export function getPublicationReadiness(config: PublicationConfig = SITE) {
  const missing: string[] = [];
  if (config.publicationStatus !== "ready-for-publication") missing.push("publication status");
  if (!config.approvedPublicName?.trim()) missing.push("approved public name");
  if (!config.legalOperator?.trim()) missing.push("legal operator");
  if (!approvedHttpsOrigin(config.canonicalOrigin)) missing.push("approved HTTPS canonical origin");
  if (!Object.values(config.policyApprovals).every(Boolean)) missing.push("approved legal policies");
  return { ready: missing.length === 0, missing } as const;
}

export function getRobotsMetadata(
  configOrPathname: PublicationConfig | string | null = SITE,
  releaseMode: SiteReleaseMode = getSiteReleaseMode(),
): Metadata["robots"] {
  if (typeof configOrPathname === "string") {
    return releaseMode === "public" && getPublicationRecord(configOrPathname)?.publicationClass === "PUBLIC_INDEXABLE"
      ? { index: true, follow: true }
      : { index: false, follow: false };
  }
  if (configOrPathname === null) return { index: false, follow: false };
  return getPublicationReadiness(configOrPathname).ready ? { index: true, follow: true } : { index: false, follow: false };
}

export function normalizePublicPathname(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//") || /^[a-z]+:/i.test(value)) return null;
  const pathname = value.split(/[?#]/, 1)[0]!.replace(/\/{2,}/g, "/");
  if (pathname.includes("..")) return null;
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

export function buildCanonical(pathname: string, config: PublicationConfig = SITE): string | null {
  const origin = approvedHttpsOrigin(config.canonicalOrigin);
  const normalized = normalizePublicPathname(pathname);
  if (!origin || !normalized || !getPublicationReadiness(config).ready) return null;
  const canonicalPathname = toTrailingSlashPathname(normalized);
  return canonicalPathname ? new URL(canonicalPathname, `${origin}/`).toString() : null;
}

export function getPageDefinition(pathname: string): PageDefinition {
  const entry = getPublicationRecord(pathname);
  if (!entry?.userFacing) throw new Error(`No public page definition for ${pathname}`);
  return { pathname: entry.pathname, title: entry.title, description: entry.description, h1: entry.h1 };
}

export function buildReleaseCanonical(pathname: string, mode: SiteReleaseMode = getSiteReleaseMode()): string | null {
  if (mode !== "public" || getPublicationRecord(pathname)?.publicationClass !== "PUBLIC_INDEXABLE") return null;
  const canonicalPathname = toTrailingSlashPathname(pathname);
  return canonicalPathname ? `${PUBLIC_CANONICAL_ORIGIN}${canonicalPathname}` : null;
}

export function createPageMetadata(pathname: string): Metadata {
  const page = getPageDefinition(pathname);
  const releaseMode = getSiteReleaseMode();
  const canonical = buildReleaseCanonical(pathname, releaseMode);
  return { title: page.title, description: page.description, robots: getRobotsMetadata(pathname, releaseMode), ...(canonical ? { alternates: { canonical } } : {}) };
}

export function getPublicRoutePathnames(): readonly string[] {
  return PUBLICATION_REGISTRY.filter((entry) => entry.publicationClass === "PUBLIC_INDEXABLE").map(({ pathname }) => pathname);
}

export function buildSitemapEntries(config?: PublicationConfig): readonly { url: string }[] {
  if (config) {
    if (!getPublicationReadiness(config).ready) return [];
    return getPublicRoutePathnames().map((pathname) => ({ url: buildCanonical(pathname, config)! }));
  }
  if (getSiteReleaseMode() !== "public") return [];
  return getPublicRoutePathnames().map((pathname) => ({ url: buildReleaseCanonical(pathname, "public")! }));
}
