import { describe, it, expect } from "vitest";
import {
  validateMoneyDurationForm,
  MONEY_DURATION_DEFAULTS,
} from "../../lib/calculators/money-duration/schema.js";
import { buildMoneyDurationPresentation } from "../../lib/calculators/money-duration/presentation.js";

describe("Money Duration Schema & Presentation", () => {
  it("validates standard default inputs correctly", () => {
    const val = validateMoneyDurationForm(MONEY_DURATION_DEFAULTS);
    expect(val.isValid).toBe(true);
    expect(val.sanitized).not.toBeNull();
    expect(val.sanitized?.initialBalance).toBe(500000);
    expect(val.sanitized?.monthlyWithdrawal).toBe(2500);
  });

  it("catches negative and invalid input boundaries", () => {
    const val = validateMoneyDurationForm({
      ...MONEY_DURATION_DEFAULTS,
      initialBalance: "-100",
      monthlyWithdrawal: "0",
      annualReturnRatePct: "60",
    });

    expect(val.isValid).toBe(false);
    expect(val.errors.initialBalance).toBeDefined();
    expect(val.errors.monthlyWithdrawal).toBeDefined();
    expect(val.errors.annualReturnRatePct).toBeDefined();
  });

  it("builds user-friendly presentation text for durations", () => {
    const val = validateMoneyDurationForm(MONEY_DURATION_DEFAULTS);
    const presentation = buildMoneyDurationPresentation(val.sanitized!);

    expect(presentation.headlineDurationText).toContain("yr");
    expect(presentation.totalWithdrawals).toBeGreaterThan(0);
    expect(presentation.annualRows.length).toBeGreaterThan(0);
  });
});
