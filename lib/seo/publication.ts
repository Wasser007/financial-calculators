import type { Metadata } from "next";
import { calculatorHref, getLiveCalculators } from "../calculators/catalog.js";
import { SITE, type PublicationStatus } from "../site.js";

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

export function getRobotsMetadata(_config: PublicationConfig = SITE): Metadata["robots"] {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
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
  return new URL(normalized, `${origin}/`).toString();
}

export function getPageDefinition(pathname: string): PageDefinition {
  if (pathname === COMPOUND_INTEREST_PAGE.pathname) return COMPOUND_INTEREST_PAGE;
  const page = STATIC_PUBLIC_PAGES.find((entry) => entry.pathname === pathname);
  if (!page) throw new Error(`No public page definition for ${pathname}`);
  return page;
}

export function createPageMetadata(pathname: string): Metadata {
  const page = getPageDefinition(pathname);
  const canonical = buildCanonical(pathname);
  return { title: page.title, description: page.description, robots: getRobotsMetadata(), ...(canonical ? { alternates: { canonical } } : {}) };
}

export function getPublicRoutePathnames(): readonly string[] {
  const liveRoutes = getLiveCalculators().map(calculatorHref).filter((href): href is string => Boolean(href));
  return [...STATIC_PUBLIC_PAGES.map(({ pathname }) => pathname), ...liveRoutes];
}

export function buildSitemapEntries(config: PublicationConfig = SITE): readonly { url: string }[] {
  if (!getPublicationReadiness(config).ready) return [];
  return getPublicRoutePathnames().map((pathname) => ({ url: buildCanonical(pathname, config)! }));
}
