import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatCurrencyDisplay } from "../../lib/presentation/currency.js";

describe("formatCurrencyDisplay", () => {
  it.each([
    ["USD", "$1,234.50"],
    ["EUR", "€1,234.50"],
    ["GBP", "£1,234.50"],
    ["CAD", "CA$1,234.50"],
    ["AUD", "A$1,234.50"],
  ] as const)("formats %s with the real en-US Intl currency representation", (currency, expected) => {
    expect(formatCurrencyDisplay(1234.5, currency)).toBe(expected);
  });

  it("formats zero, negative, and rounded decimal values", () => {
    expect(formatCurrencyDisplay(0, "USD")).toBe("$0.00");
    expect(formatCurrencyDisplay(-12.5, "USD")).toBe("-$12.50");
    expect(formatCurrencyDisplay(1.235, "USD")).toBe("$1.24");
  });

  it("does not mutate the supplied numeric value", () => {
    const value = 9876543.21;
    expect(formatCurrencyDisplay(value, "EUR")).toBe("€9,876,543.21");
    expect(value).toBe(9876543.21);
  });

  it("does not depend on the Phase 1B numeric-only formatAmount helper", () => {
    const source = readFileSync(new URL("../../lib/presentation/currency.ts", import.meta.url), "utf8");
    expect(source).not.toContain("formatAmount");
  });
});
