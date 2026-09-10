import { describe, expect, it } from "vitest";
import { calculateLoan } from "../../lib/calculators/loan-amortization/math.js";
import { DEFAULT_LOAN_INPUTS } from "../../lib/calculators/loan-amortization/schema.js";

describe("Loan Amortization Math", () => {
  it("calculates standard 30-year fixed loan correctly", () => {
    const res = calculateLoan(DEFAULT_LOAN_INPUTS);
    expect(res.monthlyPayment).toBeCloseTo(1798.65, 0);
    expect(res.actualMonths).toBe(360);
    expect(res.schedule[0]?.beginningBalance).toBe(300000);
    expect(res.schedule[res.schedule.length - 1]?.endingBalance).toBe(0);
  });

  it("calculates zero interest loan accurately", () => {
    const res = calculateLoan({
      ...DEFAULT_LOAN_INPUTS,
      annualInterestRate: 0,
      loanTermYears: 10,
    });
    expect(res.totalInterestPaid).toBe(0);
    expect(res.monthlyPayment).toBe(2500);
    expect(res.actualMonths).toBe(120);
  });

  it("calculates savings from extra monthly payments", () => {
    const res = calculateLoan({
      ...DEFAULT_LOAN_INPUTS,
      extraMonthlyPayment: 200,
    });
    expect(res.actualMonths).toBeLessThan(360);
    expect(res.interestSaved).toBeGreaterThan(0);
    expect(res.monthsSaved).toBeGreaterThan(0);
  });
});
