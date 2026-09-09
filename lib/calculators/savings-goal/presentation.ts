import {
  calculateSavingsGoal,
  type SavingsGoalInput,
  type SavingsGoalResult,
} from "./math";

export interface AnnualScheduleRow {
  year: number;
  startingBalance: number;
  annualDeposits: number;
  annualInterest: number;
  endingBalance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
}

export interface SavingsGoalPresentation {
  requiredDeposit: number;
  depositFrequencyLabel: string;
  totalContributions: number;
  totalInterestEarned: number;
  targetAmount: number;
  initialBalance: number;
  finalBalance: number;
  annualRows: AnnualScheduleRow[];
  breakdown: {
    startingBalancePct: number;
    depositsPct: number;
    interestPct: number;
  };
}

export function buildSavingsGoalPresentation(
  input: SavingsGoalInput
): SavingsGoalPresentation {
  const result: SavingsGoalResult = calculateSavingsGoal(input);

  // 按年度聚合月度明细
  const annualMap = new Map<
    number,
    {
      startingBalance: number;
      annualDeposits: number;
      annualInterest: number;
      endingBalance: number;
    }
  >();

  for (const period of result.schedule) {
    const existing = annualMap.get(period.year);
    if (!existing) {
      annualMap.set(period.year, {
        startingBalance: period.startingBalance,
        annualDeposits: period.deposit,
        annualInterest: period.interestEarned,
        endingBalance: period.endingBalance,
      });
    } else {
      existing.annualDeposits += period.deposit;
      existing.annualInterest += period.interestEarned;
      existing.endingBalance = period.endingBalance;
    }
  }

  let cumulativeDeposits = input.initialBalance;
  let cumulativeInterest = 0;
  const annualRows: AnnualScheduleRow[] = [];

  for (const [year, data] of annualMap.entries()) {
    cumulativeDeposits += data.annualDeposits;
    cumulativeInterest += data.annualInterest;

    annualRows.push({
      year,
      startingBalance: Math.round(data.startingBalance * 100) / 100,
      annualDeposits: Math.round(data.annualDeposits * 100) / 100,
      annualInterest: Math.round(data.annualInterest * 100) / 100,
      endingBalance: Math.round(data.endingBalance * 100) / 100,
      cumulativeDeposits: Math.round(cumulativeDeposits * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });
  }

  const finalBal = result.finalBalance > 0 ? result.finalBalance : 1;
  const startingPct = Math.round((input.initialBalance / finalBal) * 1000) / 10;
  const depositsPct =
    Math.round(((result.totalContributions - input.initialBalance) / finalBal) * 1000) / 10;
  const interestPct = Math.max(
    0,
    Math.round((100 - startingPct - depositsPct) * 10) / 10
  );

  return {
    requiredDeposit: result.requiredDepositPerPeriod,
    depositFrequencyLabel: "month",
    totalContributions: result.totalContributions,
    totalInterestEarned: result.totalInterestEarned,
    targetAmount: input.targetAmount,
    initialBalance: input.initialBalance,
    finalBalance: result.finalBalance,
    annualRows,
    breakdown: {
      startingBalancePct: startingPct,
      depositsPct,
      interestPct,
    },
  };
}
