import { describe, expect, it } from "vitest";
import {
  SAVINGS_GOAL_DEFAULTS,
  validateSavingsGoalForm,
} from "../../lib/calculators/savings-goal/schema";
import { buildSavingsGoalPresentation } from "../../lib/calculators/savings-goal/presentation";

describe("Savings Goal Presentation Contract", () => {
  it("validates valid baseline defaults", () => {
    const res = validateSavingsGoalForm(SAVINGS_GOAL_DEFAULTS);
    expect(res.isValid).toBe(true);
    expect(res.sanitized).not.toBeNull();
    expect(res.sanitized?.targetAmount).toBe(50000);
    expect(res.sanitized?.initialBalance).toBe(5000);
  });

  it("catches zero or negative target and invalid durations", () => {
    const res = validateSavingsGoalForm({
      ...SAVINGS_GOAL_DEFAULTS,
      targetAmount: "0",
      years: "0",
      months: "0",
    });

    expect(res.isValid).toBe(false);
    expect(res.errors.targetAmount).toBeDefined();
    expect(res.errors.duration).toBeDefined();
  });

  it("builds annual presentation schedule and breakdown percentages correctly", () => {
    const presentation = buildSavingsGoalPresentation({
      targetAmount: 50000,
      initialBalance: 5000,
      annualReturnRatePct: 5.0,
      years: 5,
      months: 0,
      compoundsPerYear: 12,
      depositTiming: "beginning",
    });

    expect(presentation.requiredDeposit).toBeGreaterThan(0);
    expect(presentation.annualRows).toHaveLength(5);
    expect(presentation.annualRows[0].year).toBe(1);
    expect(presentation.annualRows[4].endingBalance).toBeGreaterThanOrEqual(49990);

    const { startingBalancePct, depositsPct, interestPct } = presentation.breakdown;
    expect(startingBalancePct + depositsPct + interestPct).toBeCloseTo(100, 1);
  });
});
