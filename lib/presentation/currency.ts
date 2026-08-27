import type { CurrencyCode } from "../calculator/types.js";
import {
  DEFAULT_INTERNATIONALIZATION_PROFILE,
  NUMBER_FORMAT_LOCALE_OPTIONS,
  isNumberFormatLocale,
  resolveCurrencyCode,
  resolveNumberFormatLocale,
  type NumberFormatLocale,
} from "../internationalization/model.js";

export const PRESENTATION_LOCALE_OPTIONS = NUMBER_FORMAT_LOCALE_OPTIONS;
export type PresentationLocale = NumberFormatLocale;
export const DEFAULT_PRESENTATION_LOCALE = DEFAULT_INTERNATIONALIZATION_PROFILE.numberFormatLocale;
export const isPresentationLocale = isNumberFormatLocale;
export const resolvePresentationLocale = resolveNumberFormatLocale;

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(locale: NumberFormatLocale, currency: CurrencyCode): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  const cached = currencyFormatters.get(key);
  if (cached !== undefined) return cached;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  currencyFormatters.set(key, formatter);
  return formatter;
}

/** Formats a value for display only; it does not calculate, parse, or mutate financial data. */
export function formatCurrencyDisplay(
  value: number,
  currency: CurrencyCode,
  locale: PresentationLocale = DEFAULT_PRESENTATION_LOCALE,
): string {
  const resolvedLocale = resolvePresentationLocale(locale);
  const resolvedCurrency = resolveCurrencyCode(currency);
  return getCurrencyFormatter(resolvedLocale, resolvedCurrency).format(value);
}
