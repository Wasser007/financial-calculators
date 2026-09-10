import { describe, it, expect } from "vitest";
import { calculateMoneyDuration } from "../../lib/calculators/money-duration/math.js";

describe("Money Duration Math Engine", () => {
  it("computes exact depletion for zero interest scenario", () => {
    // 120,000 本金，每月取 1,000，0% 利率 -> 恰好 120 个月（10 年 0 个月）
    const result = calculateMoneyDuration({
      initialBalance: 120000,
      monthlyWithdrawal: 1000,
      annualReturnRatePct: 0,
      withdrawalTiming: "end",
    });

    expect(result.totalYears).toBe(10);
    expect(result.remainingMonths).toBe(0);
    expect(result.isPerpetual).toBe(false);
    expect(result.finalBalance).toBe(0);
    expect(result.totalWithdrawals).toBe(120000);
    expect(result.totalInterestEarned).toBe(0);
  });

  it("extends duration when earning compound interest", () => {
    // 500,000 本金，每月取 3,000，5% 年收益
    const result = calculateMoneyDuration({
      initialBalance: 500000,
      monthlyWithdrawal: 3000,
      annualReturnRatePct: 5,
      withdrawalTiming: "end",
    });

    // 在 5% 利率下，500,000 每月提取 3,000 大约可维持 23 年
    expect(result.totalYears).toBeGreaterThan(20);
    expect(result.totalYears).toBeLessThan(30);
    expect(result.totalInterestEarned).toBeGreaterThan(0);
    expect(result.annualRows.length).toBe(result.totalYears + (result.remainingMonths > 0 ? 1 : 0));
  });

  it("flags perpetual fund when interest exceeds withdrawal", () => {
    // 1,000,000 本金，每月仅取 2,000，6% 年收益（每月收益 5,000 > 提取 2,000）
    const result = calculateMoneyDuration({
      initialBalance: 1000000,
      monthlyWithdrawal: 2000,
      annualReturnRatePct: 6,
      withdrawalTiming: "end",
    });

    expect(result.isPerpetual).toBe(true);
    expect(result.finalBalance).toBeGreaterThanOrEqual(1000000);
  });

  it("handles zero or invalid starting balance safely", () => {
    const result = calculateMoneyDuration({
      initialBalance: 0,
      monthlyWithdrawal: 1000,
      annualReturnRatePct: 5,
    });

    expect(result.totalYears).toBe(0);
    expect(result.remainingMonths).toBe(0);
    expect(result.isPerpetual).toBe(false);
    expect(result.annualRows).toHaveLength(0);
  });
});
