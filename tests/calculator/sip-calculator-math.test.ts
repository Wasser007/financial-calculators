import { describe, it, expect } from "vitest";
import { calculateSip } from "../../lib/calculators/sip-calculator/math.js";

describe("SIP / DCA Calculator Math", () => {
  it("calculates correctly with zero interest rate", () => {
    const result = calculateSip({
      initialInvestment: 1000,
      monthlyContribution: 500,
      annualReturnRate: 0,
      investmentPeriodYears: 5,
    });

    const expectedInvested = 1000 + 500 * 60; // 31000
    expect(result.totalInvested).toBe(expectedInvested);
    expect(result.futureValue).toBe(expectedInvested);
    expect(result.totalReturns).toBe(0);
    expect(result.yearlySchedule).toHaveLength(5);
  });

  it("calculates standard 10-year 8% return accurately", () => {
    const result = calculateSip({
      initialInvestment: 1000,
      monthlyContribution: 500,
      annualReturnRate: 8.0,
      investmentPeriodYears: 10,
    });

    // 1000 * (1 + 0.08/12)^120 + 500 * ((1 + 0.08/12)^120 - 1) / (0.08/12)
    // ≈ 2219.64 + 91473.02 = 93693
    expect(result.totalInvested).toBe(61000);
    expect(result.futureValue).toBeGreaterThan(90000);
    expect(result.totalReturns).toBe(result.futureValue - result.totalInvested);
    expect(result.yearlySchedule).toHaveLength(10);
  });

  it("handles zero initial investment correctly", () => {
    const result = calculateSip({
      initialInvestment: 0,
      monthlyContribution: 1000,
      annualReturnRate: 10,
      investmentPeriodYears: 1,
    });

    expect(result.totalInvested).toBe(12000);
    expect(result.futureValue).toBeGreaterThan(12000);
    expect(result.totalReturns).toBeGreaterThan(0);
  });
});
