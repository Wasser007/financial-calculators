import { describe, expect, it } from "vitest";
import { calculateSavingsGoal } from "../../lib/calculators/savings-goal/math.js";

describe("Savings Goal Calculator Math Oracle", () => {
  it("Vector 1: Standard Monthly Beginning of Period (5yr, $100k, $10k initial, 6% APY)", () => {
    const res = calculateSavingsGoal({
      targetAmount: 100000,
      initialBalance: 10000,
      annualReturnRatePct: 6.0,
      years: 5,
      months: 0,
      compoundsPerYear: 12,
      depositTiming: "beginning",
    });

    expect(res.requiredDepositPerPeriod).toBe(1233.78);
    expect(res.totalContributions).toBeCloseTo(84026.8, 0);
    expect(res.finalBalance).toBeGreaterThanOrEqual(99990);
  });

  it("Vector 2: Standard Monthly End of Period Timing Difference", () => {
    const res = calculateSavingsGoal({
      targetAmount: 100000,
      initialBalance: 10000,
      annualReturnRatePct: 6.0,
      years: 5,
      depositTiming: "end",
    });

    expect(res.requiredDepositPerPeriod).toBe(1239.95);
  });

  it("Vector 3: Zero Interest Degeneration (Pure Cash Accumulation)", () => {
    const res = calculateSavingsGoal({
      targetAmount: 60000,
      initialBalance: 12000,
      annualReturnRatePct: 0,
      years: 4,
      depositTiming: "beginning",
    });

    expect(res.requiredDepositPerPeriod).toBe(1000.0);
    expect(res.totalInterestEarned).toBe(0.0);
    expect(res.finalBalance).toBe(60000.0);
  });

  it("Vector 4: Zero Initial Balance", () => {
    const res = calculateSavingsGoal({
      targetAmount: 50000,
      initialBalance: 0,
      annualReturnRatePct: 7.0,
      years: 3,
      depositTiming: "beginning",
    });

    expect(res.requiredDepositPerPeriod).toBe(1244.93);
  });

  it("Vector 5: Already Saturated Initial Balance", () => {
    const res = calculateSavingsGoal({
      targetAmount: 20000,
      initialBalance: 25000,
      annualReturnRatePct: 5.0,
      years: 3,
      depositTiming: "beginning",
    });

    expect(res.requiredDepositPerPeriod).toBe(0);
  });
});
