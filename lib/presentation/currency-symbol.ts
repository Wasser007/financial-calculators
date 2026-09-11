export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOL_MAP[code] || code;
}
