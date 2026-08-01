import type { CurrencyCode } from "../calculator/types.js";

/** Formats a value for display only; it does not calculate, parse, or mutate financial data. */
export function formatCurrencyDisplay(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
