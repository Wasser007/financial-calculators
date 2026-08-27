import { COMPOUND_INTEREST_PAGE, buildCanonical, type PublicationConfig } from "./publication.js";
import { SITE } from "../site.js";

export type JsonLd = Record<string, unknown>;

export function buildCompoundInterestSchema(config: PublicationConfig = SITE): readonly JsonLd[] {
  const url = buildCanonical(COMPOUND_INTEREST_PAGE.pathname, config);
  if (!url || !config.approvedPublicName || !config.legalOperator) return [];
  return [
    { "@context": "https://schema.org", "@type": "WebApplication", name: COMPOUND_INTEREST_PAGE.h1, description: COMPOUND_INTEREST_PAGE.description, url, applicationCategory: "FinanceApplication", operatingSystem: "Any" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Calculators", item: buildCanonical("/calculators", config) },
      { "@type": "ListItem", position: 2, name: COMPOUND_INTEREST_PAGE.h1, item: url },
    ] },
  ];
}

export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
