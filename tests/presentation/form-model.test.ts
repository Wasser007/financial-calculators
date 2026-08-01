import { beforeEach, describe, expect, it, vi } from "vitest";

const evaluateCalls = vi.hoisted(() => [] as unknown[]);

vi.mock("../../lib/calculator/engine.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/calculator/engine.js")>();
  return {
    ...actual,
    evaluateCalculator: (inputs: Parameters<typeof actual.evaluateCalculator>[0]) => {
      evaluateCalls.push(inputs);
      return actual.evaluateCalculator(inputs);
    },
  };
});

import {
  defaultDrafts,
  draftsToInputs,
  evaluateDrafts,
} from "../../lib/presentation/form-model.js";

describe("form draft conversion", () => {
  beforeEach(() => evaluateCalls.splice(0));

  it("converts all ten frozen defaults at the UI/core boundary", () => {
    expect(draftsToInputs(defaultDrafts())).toEqual({
      inputs: {
        currency: "USD",
        initialPrincipal: 10000,
        contributionAmount: 500,
        contributionFrequency: "monthly",
        contributionTiming: "end",
        durationMonths: 120,
        nominalAnnualRate: 0.07,
        compoundingFrequency: "monthly",
        nominalAnnualFeeRate: 0,
        inflationRate: 0.03,
      },
      errors: [],
    });
  });

  it("keeps amounts and months unchanged while converting all percentages", () => {
    const parsed = draftsToInputs({
      ...defaultDrafts(),
      initialPrincipal: "12.34",
      contributionAmount: "5.60",
      durationMonths: "18",
      nominalAnnualRate: "1.25",
      nominalAnnualFeeRate: "2.50",
      inflationRate: "3.75",
    });
    expect(parsed.inputs).toMatchObject({
      initialPrincipal: 12.34,
      contributionAmount: 5.6,
      durationMonths: 18,
      nominalAnnualRate: 0.0125,
      nominalAnnualFeeRate: 0.025,
      inflationRate: 0.0375,
    });
  });

  it.each(["1", "1.0", "1.00"])("accepts zero, one, or two decimal places: %s", (value) => {
    expect(draftsToInputs({ ...defaultDrafts(), initialPrincipal: value }).errors).toEqual([]);
  });

  it("rejects excess decimals before numeric conversion", () => {
    expect(draftsToInputs({ ...defaultDrafts(), initialPrincipal: "1.000" }).errors)
      .toMatchObject([{ field: "initialPrincipal", code: "TOO_MANY_DECIMALS" }]);
  });

  it.each(["1.0", "1.25"])("rejects a decimal-form month value: %s", (durationMonths) => {
    expect(draftsToInputs({ ...defaultDrafts(), durationMonths }).errors)
      .toMatchObject([{ field: "durationMonths", code: "INTEGER_REQUIRED" }]);
  });

  it.each(["", "   ", "1,000", "1 000", "$100", "1e3", "NaN", "Infinity", "--1", "+-1"])(
    "rejects unsupported numeric syntax: %j",
    (initialPrincipal) => {
      expect(draftsToInputs({ ...defaultDrafts(), initialPrincipal }).errors)
        .toMatchObject([{ field: "initialPrincipal", code: "NOT_FINITE" }]);
    },
  );

  it("rejects a syntactically valid number that overflows", () => {
    const initialPrincipal = "9".repeat(400);
    expect(draftsToInputs({ ...defaultDrafts(), initialPrincipal }).errors)
      .toMatchObject([{ field: "initialPrincipal", code: "NOT_FINITE" }]);
  });

  it.each(["USD", "EUR", "GBP", "CAD", "AUD"])("accepts currency %s", (currency) => {
    expect(draftsToInputs({ ...defaultDrafts(), currency }).inputs?.currency).toBe(currency);
  });

  it.each(["monthly", "quarterly", "annually"])("accepts contribution frequency %s", (value) => {
    expect(draftsToInputs({ ...defaultDrafts(), contributionFrequency: value }).inputs?.contributionFrequency).toBe(value);
  });

  it.each(["beginning", "end"])("accepts contribution timing %s", (value) => {
    expect(draftsToInputs({ ...defaultDrafts(), contributionTiming: value }).inputs?.contributionTiming).toBe(value);
  });

  it.each(["daily", "monthly", "quarterly", "semi-annually", "annually"])("accepts compounding frequency %s", (value) => {
    expect(draftsToInputs({ ...defaultDrafts(), compoundingFrequency: value }).inputs?.compoundingFrequency).toBe(value);
  });

  it.each([
    ["currency", { currency: "CHF" }],
    ["contributionFrequency", { contributionFrequency: "weekly" }],
    ["contributionTiming", { contributionTiming: "middle" }],
    ["compoundingFrequency", { compoundingFrequency: "weekly" }],
  ] as const)("rejects an unsupported %s", (field, override) => {
    const parsed = draftsToInputs({ ...defaultDrafts(), ...override });
    expect(parsed.inputs).toBeUndefined();
    expect(parsed.errors).toMatchObject([{ field, code: "UNSUPPORTED_ENUM" }]);
  });

  it("collects simultaneous parse errors in stable adapter order", () => {
    const invalid = {
      ...defaultDrafts(),
      initialPrincipal: "",
      contributionAmount: "$2",
      durationMonths: "2.5",
      nominalAnnualRate: "1e2",
      nominalAnnualFeeRate: "1.234",
      inflationRate: "NaN",
      currency: "CHF",
      contributionFrequency: "weekly",
      contributionTiming: "middle",
      compoundingFrequency: "weekly",
    };
    expect(draftsToInputs(invalid).errors.map((issue) => issue.field)).toEqual([
      "initialPrincipal",
      "contributionAmount",
      "durationMonths",
      "nominalAnnualRate",
      "nominalAnnualFeeRate",
      "inflationRate",
      "currency",
      "contributionFrequency",
      "contributionTiming",
      "compoundingFrequency",
    ]);
  });

  it("does not evaluate when parsing fails", () => {
    expect(evaluateDrafts({ ...defaultDrafts(), initialPrincipal: "bad" }).evaluation).toBeUndefined();
    expect(evaluateCalls).toHaveLength(0);
  });

  it("preserves Phase 1B validation error order", () => {
    const parsed = draftsToInputs({
      ...defaultDrafts(),
      initialPrincipal: "1000000001",
      contributionAmount: "100000001",
      durationMonths: "1201",
      nominalAnnualRate: "201",
      nominalAnnualFeeRate: "21",
      inflationRate: "51",
    });
    expect(parsed.errors.map((issue) => issue.field)).toEqual([
      "initialPrincipal",
      "contributionAmount",
      "durationMonths",
      "nominalAnnualRate",
      "nominalAnnualFeeRate",
      "inflationRate",
    ]);
  });
});
