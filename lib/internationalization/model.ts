import type { CurrencyCode } from "../calculator/types.js";

export const MARKET_OPTIONS = ["global", "US", "GB", "DE", "FR", "ES", "IT"] as const;
export type Market = (typeof MARKET_OPTIONS)[number];

export type TextDirection = "ltr" | "rtl";
export type ContentLanguagePublicationStatus = "published" | "planned";

export interface ContentLanguageDefinition {
  tag: string;
  label: string;
  direction: TextDirection;
  publicationStatus: ContentLanguagePublicationStatus;
}

export const CONTENT_LANGUAGES = [
  { tag: "en-US", label: "English (United States)", direction: "ltr", publicationStatus: "published" },
  { tag: "en-GB", label: "English (United Kingdom)", direction: "ltr", publicationStatus: "planned" },
  { tag: "de-DE", label: "Deutsch (Deutschland)", direction: "ltr", publicationStatus: "planned" },
  { tag: "fr-FR", label: "français (France)", direction: "ltr", publicationStatus: "planned" },
  { tag: "es-ES", label: "español (España)", direction: "ltr", publicationStatus: "planned" },
] as const satisfies readonly ContentLanguageDefinition[];
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number]["tag"];
export type PublishedContentLanguage = Extract<(typeof CONTENT_LANGUAGES)[number], { publicationStatus: "published" }>["tag"];
export const DEFAULT_PUBLISHED_CONTENT_LANGUAGE = CONTENT_LANGUAGES[0];

export const NUMBER_FORMAT_LOCALE_OPTIONS = [
  ["en-US", "United States (en-US)"],
  ["en-GB", "United Kingdom (en-GB)"],
  ["de-DE", "Germany (de-DE)"],
  ["fr-FR", "France (fr-FR)"],
] as const;
export type NumberFormatLocale = (typeof NUMBER_FORMAT_LOCALE_OPTIONS)[number][0];

export const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD"] as const satisfies readonly CurrencyCode[];

export const LEGAL_JURISDICTION_OPTIONS = ["unconfirmed", "US", "GB", "DE", "FR", "ES", "IT"] as const;
export type LegalJurisdiction = (typeof LEGAL_JURISDICTION_OPTIONS)[number];

export const SEO_LOCALES = [
  { tag: "en-US", contentLanguage: "en-US", publicationStatus: "published", pathPrefix: "" },
] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number]["tag"];

export const CONSENT_REGION_OPTIONS = ["unknown", "eu-eea", "uk", "us-california", "us-other", "other"] as const;
export type ConsentRegion = (typeof CONSENT_REGION_OPTIONS)[number];

export interface InternationalizationProfile {
  market: Market;
  contentLanguage: PublishedContentLanguage;
  numberFormatLocale: NumberFormatLocale;
  currency: CurrencyCode;
  legalJurisdiction: LegalJurisdiction;
  seoLocale: SeoLocale;
  consentRegion: ConsentRegion;
}

export const DEFAULT_INTERNATIONALIZATION_PROFILE: InternationalizationProfile = Object.freeze({
  market: "global",
  contentLanguage: DEFAULT_PUBLISHED_CONTENT_LANGUAGE.tag,
  numberFormatLocale: "en-US",
  currency: "USD",
  legalJurisdiction: "unconfirmed",
  seoLocale: "en-US",
  consentRegion: "unknown",
});

function includes<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === "string" && options.some((option) => option === value);
}

export function isMarket(value: unknown): value is Market { return includes(MARKET_OPTIONS, value); }
export function resolveMarket(value: unknown): Market { return isMarket(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.market; }

export function isContentLanguage(value: unknown): value is ContentLanguage {
  return typeof value === "string" && CONTENT_LANGUAGES.some(({ tag }) => tag === value);
}

export function isPublishedContentLanguage(value: unknown): value is PublishedContentLanguage {
  return typeof value === "string" && CONTENT_LANGUAGES.some(({ tag, publicationStatus }) => tag === value && publicationStatus === "published");
}

export function resolvePublishedContentLanguage(value: unknown): PublishedContentLanguage {
  return isPublishedContentLanguage(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.contentLanguage;
}

export function isNumberFormatLocale(value: unknown): value is NumberFormatLocale {
  return typeof value === "string" && NUMBER_FORMAT_LOCALE_OPTIONS.some(([locale]) => locale === value);
}

export function resolveNumberFormatLocale(value: unknown): NumberFormatLocale {
  return isNumberFormatLocale(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.numberFormatLocale;
}

export function isCurrencyCode(value: unknown): value is CurrencyCode { return includes(CURRENCY_OPTIONS, value); }
export function resolveCurrencyCode(value: unknown): CurrencyCode { return isCurrencyCode(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.currency; }

export function isLegalJurisdiction(value: unknown): value is LegalJurisdiction { return includes(LEGAL_JURISDICTION_OPTIONS, value); }
export function resolveLegalJurisdiction(value: unknown): LegalJurisdiction {
  return isLegalJurisdiction(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.legalJurisdiction;
}

export function isSeoLocale(value: unknown): value is SeoLocale {
  return typeof value === "string" && SEO_LOCALES.some(({ tag }) => tag === value);
}
export function resolveSeoLocale(value: unknown): SeoLocale { return isSeoLocale(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.seoLocale; }

export function isConsentRegion(value: unknown): value is ConsentRegion { return includes(CONSENT_REGION_OPTIONS, value); }
export function resolveConsentRegion(value: unknown): ConsentRegion {
  return isConsentRegion(value) ? value : DEFAULT_INTERNATIONALIZATION_PROFILE.consentRegion;
}

/** Resolves every dimension independently; no field supplies a default for another field. */
export function createInternationalizationProfile(input: Partial<Record<keyof InternationalizationProfile, unknown>> = {}): InternationalizationProfile {
  return {
    market: resolveMarket(input.market),
    contentLanguage: resolvePublishedContentLanguage(input.contentLanguage),
    numberFormatLocale: resolveNumberFormatLocale(input.numberFormatLocale),
    currency: resolveCurrencyCode(input.currency),
    legalJurisdiction: resolveLegalJurisdiction(input.legalJurisdiction),
    seoLocale: resolveSeoLocale(input.seoLocale),
    consentRegion: resolveConsentRegion(input.consentRegion),
  };
}

export interface NonEssentialProcessingPolicy {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
}

/** No nonessential integration exists in the current release, including for recognized regions. */
export function getNonEssentialProcessingPolicy(_region: ConsentRegion): NonEssentialProcessingPolicy {
  return { analytics: false, advertising: false, personalization: false };
}

export interface SeoLanguageAlternate { language: SeoLocale; url: string }

/** Hreflang is intentionally empty until at least two real, published locale routes exist. */
export function buildSeoLanguageAlternates(origin: string | null, pathname: string): readonly SeoLanguageAlternate[] {
  if (origin === null || SEO_LOCALES.length < 2) return [];
  return SEO_LOCALES.map(({ tag, pathPrefix }) => ({
    language: tag,
    url: new URL(`${pathPrefix}${pathname}`, origin).toString(),
  }));
}
