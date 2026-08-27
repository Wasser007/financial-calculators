import { DEFAULT_PUBLISHED_CONTENT_LANGUAGE } from "./internationalization/model.js";

export type PublicationStatus = "prelaunch" | "ready-for-publication";

export const SITE = {
  name: "ClearMoney Tools",
  approvedPublicName: null as string | null,
  legalOperator: null as string | null,
  lastUpdated: "August 25, 2026",
  canonicalOrigin: null as string | null,
  feedbackAddress: null as string | null,
  feedbackAddressVerified: false,
  publicationStatus: "prelaunch" as PublicationStatus,
  defaultContentLanguage: DEFAULT_PUBLISHED_CONTENT_LANGUAGE.tag,
  policyApprovals: {
    privacy: false,
    terms: false,
    disclaimer: false,
  },
} as const;

export const primaryNavigation = [
  { href: "/calculators", label: "Calculators" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
] as const;

export const trustNavigation = [
  { href: "/editorial-policy", label: "Editorial policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

export function isCurrentSection(pathname: string, href: string): boolean {
  return pathname === href || (href === "/calculators" && pathname.startsWith("/calculators/"));
}
