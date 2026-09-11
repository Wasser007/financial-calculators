import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assertCalculatorCatalogInvariants, calculatorCatalog, calculatorGoals, calculatorHref, getFeaturedCalculator, getListedCalculators, getLiveCalculators, getRelatedCalculators, type CalculatorDefinition } from "../../lib/calculators/catalog.js";

function mutableCatalog(): CalculatorDefinition[] {
  return structuredClone(calculatorCatalog) as unknown as CalculatorDefinition[];
}

describe("calculator catalog", () => {
  it("centrally models the ten-tool product sequence and every required field", () => {
    expect(calculatorCatalog).toHaveLength(10);
    expect(calculatorCatalog.map((calculator) => calculator.name)).toEqual([
      "Compound Interest Calculator", "Savings Goal Calculator", "How Long Will My Money Last?",
      "Loan Payment & Amortization Calculator", "Loan Payoff Calculator", "APY / Effective Interest Rate Calculator",
      "CAGR Calculator", "Future Value Calculator", "Mortgage Calculator", "Rent vs Buy Calculator",
    ]);
    expect(new Set(calculatorCatalog.map((calculator) => calculator.slug)).size).toBe(10);
    for (const calculator of calculatorCatalog) {
      expect(calculatorGoals).toContain(calculator.goal);
      expect(calculator.shortDescription).not.toBe("");
      expect(calculator.metadata.title).not.toBe("");
      expect(calculator.metadata.description).not.toBe("");
      expect(Array.isArray(calculator.relatedCalculators)).toBe(true);
    }
  });

  it("keeps compound interest as the only live and featured tool", () => {
    expect(getLiveCalculators().map((calculator) => calculator.slug)).toEqual(["compound-interest", "savings-goal", "how-long-will-my-money-last", "loan-mortgage-amortization", "loan-payoff"]);
    expect(getFeaturedCalculator().slug).toBe("compound-interest");
    expect(getListedCalculators().filter((calculator) => calculator.availability === "live")).toHaveLength(5);
  });

  it("never produces links for unavailable tools", () => {
    for (const calculator of calculatorCatalog) {
      expect(calculatorHref(calculator)).toBe(calculator.availability === "live" ? calculator.route : undefined);
    }
  });

  it("derives each public live route from the catalog and proves its App Router page exists", () => {
    for (const calculator of calculatorCatalog.filter((item) => item.availability === "live" && item.publicListing)) {
      const route = calculatorHref(calculator);
      expect(route).toBe(`/calculators/${calculator.slug}`);
      expect(existsSync(fileURLToPath(new URL(`../../app${route}/page.tsx`, import.meta.url)))).toBe(true);
    }
  });

  it("models the next user questions without dead links", () => {
    const related = getRelatedCalculators("compound-interest");
    expect(related.map((calculator) => calculator.slug)).toEqual(["savings-goal", "how-long-will-my-money-last"]);
    const savingsGoal = related.find((c) => c.slug === "savings-goal");
    expect(savingsGoal?.availability).toBe("live");
    expect(calculatorHref(savingsGoal!)).toBe("/calculators/savings-goal");
    const moneyDuration = related.find((c) => c.slug === "how-long-will-my-money-last");
    expect(moneyDuration?.availability).toBe("live");
    expect(calculatorHref(moneyDuration!)).toBe("/calculators/how-long-will-my-money-last");
    const plannedTool = getListedCalculators().find((c) => c.availability === "planned");
    expect(plannedTool?.availability).toBe("planned");
    expect(calculatorHref(plannedTool!)).toBeUndefined();
  });

  it("does not leak non-public planned tools into public related results", () => {
    expect(getRelatedCalculators("loan-payment-amortization")).toEqual([]);
    expect(getRelatedCalculators("cagr").map(({ slug }) => slug)).toEqual(["compound-interest"]);
    expect(getListedCalculators().some(({ publicListing }) => !publicListing)).toBe(false);
  });

  it("enforces catalog invariants at runtime", () => {
    expect(() => assertCalculatorCatalogInvariants(calculatorCatalog)).not.toThrow();

    const duplicateSlug = mutableCatalog();
    duplicateSlug[1] = { ...duplicateSlug[1]!, slug: duplicateSlug[0]!.slug };
    expect(() => assertCalculatorCatalogInvariants(duplicateSlug)).toThrow(/Duplicate calculator slug/);

    const noFeatured = mutableCatalog();
    noFeatured[0] = { ...noFeatured[0]!, featured: false };
    expect(() => assertCalculatorCatalogInvariants(noFeatured)).toThrow(/exactly one live featured/);

    const plannedFeatured = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    plannedFeatured[5]!.featured = true;
    expect(() => assertCalculatorCatalogInvariants(plannedFeatured as unknown as CalculatorDefinition[])).toThrow(/Planned calculator cannot be featured/);

    const missingRelated = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    missingRelated[0]!.relatedCalculators = ["missing"];
    expect(() => assertCalculatorCatalogInvariants(missingRelated as unknown as CalculatorDefinition[])).toThrow(/Unknown related calculator/);

    const selfRelated = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    selfRelated[0]!.relatedCalculators = ["compound-interest"];
    expect(() => assertCalculatorCatalogInvariants(selfRelated as unknown as CalculatorDefinition[])).toThrow(/cannot relate to itself/);

    const duplicateRelated = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    duplicateRelated[0]!.relatedCalculators = ["savings-goal", "savings-goal"];
    expect(() => assertCalculatorCatalogInvariants(duplicateRelated as unknown as CalculatorDefinition[])).toThrow(/Duplicate related calculator/);

    const plannedRoute = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    plannedRoute[5]!.route = "/calculators/apy-effective-interest-rate";
    expect(() => assertCalculatorCatalogInvariants(plannedRoute as unknown as CalculatorDefinition[])).toThrow(/Planned calculator cannot have a route/);

    const mismatchedLiveRoute = mutableCatalog() as unknown as Array<Record<string, unknown>>;
    mismatchedLiveRoute[0]!.route = "/calculators/not-real";
    expect(() => assertCalculatorCatalogInvariants(mismatchedLiveRoute as unknown as CalculatorDefinition[])).toThrow(/route must match its slug/);
  });
});
