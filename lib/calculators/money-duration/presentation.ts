import {
  calculateMoneyDuration,
  type MoneyDurationAnnualRow,
} from "./math.js";
import type { MoneyDurationSanitizedValues } from "./schema.js";

export interface MoneyDurationPresentation {
  years: number;
  months: number;
  headlineDurationText: string;
  isPerpetual: boolean;
  totalWithdrawals: number;
  totalInterestEarned: number;
  finalBalance: number;
  annualRows: MoneyDurationAnnualRow[];
}

export function buildMoneyDurationPresentation(
  sanitized: MoneyDurationSanitizedValues
): MoneyDurationPresentation {
  const result = calculateMoneyDuration({
    initialBalance: sanitized.initialBalance,
    monthlyWithdrawal: sanitized.monthlyWithdrawal,
    annualReturnRatePct: sanitized.annualReturnRatePct,
    annualInflationRatePct: sanitized.annualInflationRatePct,
    withdrawalTiming: sanitized.withdrawalTiming,
  });

  let headlineDurationText = "";
  if (result.isPerpetual) {
    headlineDurationText = "Permanent (100+ Years)";
  } else if (result.totalYears === 0 && result.remainingMonths === 0) {
    headlineDurationText = "0 Months";
  } else {
    const yearPart = result.totalYears > 0 ? `${result.totalYears} yr${result.totalYears > 1 ? "s" : ""}` : "";
    const monthPart = result.remainingMonths > 0 ? `${result.remainingMonths} mo${result.remainingMonths > 1 ? "s" : ""}` : "";
    headlineDurationText = [yearPart, monthPart].filter(Boolean).join(" ");
  }

  return {
    years: result.totalYears,
    months: result.remainingMonths,
    headlineDurationText,
    isPerpetual: result.isPerpetual,
    totalWithdrawals: result.totalWithdrawals,
    totalInterestEarned: result.totalInterestEarned,
    finalBalance: result.finalBalance,
    annualRows: result.annualRows,
  };
}
