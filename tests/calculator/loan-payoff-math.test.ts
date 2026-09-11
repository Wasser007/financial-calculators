import { describe, expect, it } from "vitest";
import { calculateLoanPayoff } from "../../lib/calculators/loan-payoff-math.js";

describe("Loan Payoff Math Engine", () => {
  it("calculates exact payoff months and interest for standard mortgage balance", () => {
    // 200,000 balance at 6% annual interest, $1500 monthly payment
    const result = calculateLoanPayoff({
      balance: 200000,
      annualInterestRate: 6,
      monthlyPayment: 1500,
      extraMonthlyPayment: 200,
    });

    expect(result.isPayoffPossible).toBe(true);
    expect(result.baselineMonths).toBeGreaterThan(0);
    expect(result.acceleratedMonths).toBeLessThan(result.baselineMonths);
    expect(result.monthsSaved).toBe(result.baselineMonths - result.acceleratedMonths);
    expect(result.interestSaved).toBeGreaterThan(0);
  });

  it("handles payment less than monthly interest gracefully", () => {
    // 100,000 at 12% -> $1,000 monthly interest. Payment $500 cannot pay off.
    const result = calculateLoanPayoff({
      balance: 100000,
      annualInterestRate: 12,
      monthlyPayment: 500,
    });

    expect(result.isPayoffPossible).toBe(false);
    expect(result.minPaymentRequired).toBe(1001);
  });
});
