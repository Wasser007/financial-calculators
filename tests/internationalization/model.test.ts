import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DEFAULT_INPUTS, evaluateCalculator, parseCalculatorQuery, serializeCalculatorQuery } from "../../lib/calculator/index.js";
import {
  CONSENT_REGION_OPTIONS,
  CONTENT_LANGUAGES,
  CURRENCY_OPTIONS,
  DEFAULT_INTERNATIONALIZATION_PROFILE,
  DEFAULT_PUBLISHED_CONTENT_LANGUAGE,
  MARKET_OPTIONS,
  NUMBER_FORMAT_LOCALE_OPTIONS,
  SEO_LOCALES,
  buildSeoLanguageAlternates,
  createInternationalizationProfile,
  getNonEssentialProcessingPolicy,
  resolveCurrencyCode,
  resolveMarket,
  resolveNumberFormatLocale,
} from "../../lib/internationalization/model.js";
import { formatCurrencyDisplay } from "../../lib/presentation/currency.js";

function rawSummary(currency: (typeof CURRENCY_OPTIONS)[number]) {
  const evaluated = evaluateCalculator({ ...DEFAULT_INPUTS, currency });
  if (!evaluated.result) throw new Error("defaults must evaluate");
  const { monthlyLedger: _monthly, annualSchedule: _annual, ...summary } = evaluated.result;
  return summary;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = `${directory}/${name}`;
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(?:ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("internationalization domain model", () => {
  it("models seven independent dimensions with conservative public defaults", () => {
    expect(Object.keys(DEFAULT_INTERNATIONALIZATION_PROFILE)).toEqual([
      "market", "contentLanguage", "numberFormatLocale", "currency", "legalJurisdiction", "seoLocale", "consentRegion",
    ]);
    expect(DEFAULT_INTERNATIONALIZATION_PROFILE).toEqual({
      market: "global", contentLanguage: "en-US", numberFormatLocale: "en-US", currency: "USD",
      legalJurisdiction: "unconfirmed", seoLocale: "en-US", consentRegion: "unknown",
    });
  });

  it("does not infer any dimension from another dimension", () => {
    expect(createInternationalizationProfile({ market: "US", currency: "EUR", numberFormatLocale: "de-DE" })).toEqual({
      market: "US", contentLanguage: "en-US", numberFormatLocale: "de-DE", currency: "EUR",
      legalJurisdiction: "unconfirmed", seoLocale: "en-US", consentRegion: "unknown",
    });
    expect(createInternationalizationProfile({ contentLanguage: "de-DE", legalJurisdiction: "DE", consentRegion: "eu-eea" })).toEqual({
      market: "global", contentLanguage: "en-US", numberFormatLocale: "en-US", currency: "USD",
      legalJurisdiction: "DE", seoLocale: "en-US", consentRegion: "eu-eea",
    });
  });

  it("uses registered identifiers and exposes only the actual English publication", () => {
    for (const { tag, direction } of CONTENT_LANGUAGES) {
      expect(Intl.getCanonicalLocales(tag)).toEqual([tag]);
      expect(["ltr", "rtl"]).toContain(direction);
    }
    for (const [locale] of NUMBER_FORMAT_LOCALE_OPTIONS) expect(Intl.getCanonicalLocales(locale)).toEqual([locale]);
    expect(MARKET_OPTIONS).toEqual(["global", "US", "GB", "DE", "FR", "ES", "IT"]);
    expect(CURRENCY_OPTIONS).toEqual(["USD", "EUR", "GBP", "CAD", "AUD"]);
    expect(SEO_LOCALES).toEqual([{ tag: "en-US", contentLanguage: "en-US", publicationStatus: "published", pathPrefix: "" }]);
    expect(CONTENT_LANGUAGES.filter(({ publicationStatus }) => publicationStatus === "published").map(({ tag }) => tag)).toEqual(["en-US"]);
  });

  it("resolves the public document language and direction from the default published definition", () => {
    expect(DEFAULT_PUBLISHED_CONTENT_LANGUAGE).toMatchObject({
      tag: "en-US", direction: "ltr", publicationStatus: "published",
    });
    expect(createInternationalizationProfile({ contentLanguage: "en-GB" }).contentLanguage).toBe("en-US");
    expect(createInternationalizationProfile({ contentLanguage: "invalid" }).contentLanguage).toBe("en-US");
  });

  it("falls back safely from invalid market, locale, and currency values without cross-field changes", () => {
    expect(resolveMarket("EU")).toBe("global");
    expect(resolveNumberFormatLocale("es-ES")).toBe("en-US");
    expect(resolveCurrencyCode("CHF")).toBe("USD");
    expect(createInternationalizationProfile({ market: "invalid", numberFormatLocale: 42, currency: "CHF" })).toEqual(DEFAULT_INTERNATIONALIZATION_PROFILE);
  });

  it("formats all approved currency and number-format combinations with Intl while keeping raw calculations invariant", () => {
    const baseline = rawSummary("USD");
    for (const currency of CURRENCY_OPTIONS) {
      expect(rawSummary(currency)).toEqual(baseline);
      for (const [locale] of NUMBER_FORMAT_LOCALE_OPTIONS) {
        expect(formatCurrencyDisplay(1234.5, currency, locale)).toBe(new Intl.NumberFormat(locale, {
          style: "currency", currency, currencyDisplay: "symbol", minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(1234.5));
      }
    }
  });

  it("keeps the frozen versioned currency URL contract round-trippable", () => {
    const query = serializeCalculatorQuery({ ...DEFAULT_INPUTS, currency: "EUR" });
    expect(query).toBe("?v=1&cur=EUR");
    expect(parseCalculatorQuery(query).inputs.currency).toBe("EUR");
  });

  it("defaults unknown consent to no nonessential processing and never derives it from language", () => {
    expect(CONSENT_REGION_OPTIONS).toContain("unknown");
    expect(createInternationalizationProfile({ contentLanguage: "en-US", numberFormatLocale: "de-DE" }).consentRegion).toBe("unknown");
    expect(getNonEssentialProcessingPolicy("unknown")).toEqual({ analytics: false, advertising: false, personalization: false });
  });

  it("does not emit hreflang or create fake localized App Router branches", () => {
    expect(buildSeoLanguageAlternates("https://example.com", "/calculators/compound-interest")).toEqual([]);
    const appRoot = fileURLToPath(new URL("../../app", import.meta.url));
    expect(readdirSync(appRoot)).not.toContain("[lang]");
    expect(readdirSync(appRoot)).not.toContain("[locale]");
  });

  it("contains no tracking, browser-language, geolocation, cookie, or storage integration", () => {
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const source = [...sourceFiles(`${root}/app`), ...sourceFiles(`${root}/components`), ...sourceFiles(`${root}/lib`)]
      .map((path) => readFileSync(path, "utf8")).join("\n");
    expect(source).not.toMatch(/Accept-Language|navigator\.language|geolocation|getCurrentPosition|localStorage|sessionStorage|document\.cookie|gtag\s*\(|GoogleAnalytics|trackingId/);
  });
});
