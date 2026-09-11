import { describe, expect, it } from "vitest";
import { buildLoanPayoffPresentation } from "../../lib/calculators/loan-payoff-presentation.js";

describe("Loan Payoff Presentation Layer", () => {
  const mockFormat = (n: number) => `$${n.toLocaleString()}`;

  it("formats baseline and accelerated payoff durations correctly", () => {
    const presentation = buildLoanPayoffPresentation(
      {
        balance: 100000,
        annualInterestRate: 5,
        monthlyPayment: 1000,
        extraMonthlyPayment: 200,
      },
      mockFormat
    );

    expect(presentation.isValid).toBe(true);
    expect(presentation.formattedMetrics.baselineTime).toMatch(/(yr|mo)/);
    expect(presentation.formattedMetrics.timeSaved).toMatch(/(yr|mo)/);
    expect(presentation.formattedMetrics.interestSaved).toContain("$");
  });

  it("provides informative message when payment is insufficient", () => {
    const presentation = buildLoanPayoffPresentation(
      {
        balance: 100000,
        annualInterestRate: 12,
        monthlyPayment: 200,
      },
      mockFormat
    );

    expect(presentation.isValid).toBe(false);
    expect(presentation.statusMessage).toContain("Monthly payment must exceed monthly interest");
  });
});
