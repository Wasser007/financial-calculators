import type { DepositTiming } from "./math.js";

export interface SavingsGoalFormValues {
  targetAmount: string;
  initialBalance: string;
  years: string;
  months: string;
  annualReturnRatePct: string;
  depositTiming: DepositTiming;
}

export interface SavingsGoalValidationErrors {
  targetAmount?: string;
  initialBalance?: string;
  duration?: string;
  annualReturnRatePct?: string;
}

export const SAVINGS_GOAL_DEFAULTS: SavingsGoalFormValues = Object.freeze({
  targetAmount: "50000",
  initialBalance: "5000",
  years: "5",
  months: "0",
  annualReturnRatePct: "5.0",
  depositTiming: "beginning" as DepositTiming,
});

export function validateSavingsGoalForm(values: SavingsGoalFormValues): {
  isValid: boolean;
  errors: SavingsGoalValidationErrors;
  sanitized: {
    targetAmount: number;
    initialBalance: number;
    years: number;
    months: number;
    annualReturnRatePct: number;
    depositTiming: DepositTiming;
  } | null;
} {
  const errors: SavingsGoalValidationErrors = {};

  const target = Number(values.targetAmount.replace(/,/g, ""));
  if (isNaN(target) || target <= 0) {
    errors.targetAmount = "Please enter a savings goal greater than 0.";
  } else if (target > 100000000) {
    errors.targetAmount = "Savings goal must not exceed 100,000,000.";
  }

  const initial = Number(values.initialBalance.replace(/,/g, ""));
  if (isNaN(initial) || initial < 0) {
    errors.initialBalance = "Starting amount cannot be negative.";
  } else if (initial > 100000000) {
    errors.initialBalance = "Starting amount must not exceed 100,000,000.";
  }

  const years = parseInt(values.years, 10) || 0;
  const months = parseInt(values.months, 10) || 0;
  if (years < 0 || months < 0 || months > 11) {
    errors.duration = "Please enter a valid time horizon.";
  } else if (years === 0 && months === 0) {
    errors.duration = "Total duration must be at least 1 month.";
  } else if (years > 80) {
    errors.duration = "Duration cannot exceed 80 years.";
  }

  const rate = Number(values.annualReturnRatePct);
  if (isNaN(rate) || rate < 0) {
    errors.annualReturnRatePct = "Estimated return rate cannot be negative.";
  } else if (rate > 50) {
    errors.annualReturnRatePct = "Return rate cannot exceed 50%.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid
      ? {
          targetAmount: target,
          initialBalance: initial,
          years,
          months,
          annualReturnRatePct: rate,
          depositTiming: values.depositTiming === "end" ? "end" : "beginning",
        }
      : null,
  };
}
