export interface MoneyDurationFormValues {
  initialBalance: string;
  monthlyWithdrawal: string;
  annualReturnRatePct: string;
  annualInflationRatePct: string;
  withdrawalTiming: "beginning" | "end";
}

export interface MoneyDurationSanitizedValues {
  initialBalance: number;
  monthlyWithdrawal: number;
  annualReturnRatePct: number;
  annualInflationRatePct: number;
  withdrawalTiming: "beginning" | "end";
}

export interface MoneyDurationValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof MoneyDurationFormValues, string>>;
  sanitized: MoneyDurationSanitizedValues | null;
}

export const MONEY_DURATION_DEFAULTS: MoneyDurationFormValues = {
  initialBalance: "500000",
  monthlyWithdrawal: "2500",
  annualReturnRatePct: "5.0",
  annualInflationRatePct: "2.5",
  withdrawalTiming: "beginning",
};

export function validateMoneyDurationForm(
  form: MoneyDurationFormValues
): MoneyDurationValidationResult {
  const errors: Partial<Record<keyof MoneyDurationFormValues, string>> = {};

  const initialBalance = parseFloat(form.initialBalance.replace(/,/g, "").trim());
  if (isNaN(initialBalance) || initialBalance < 0) {
    errors.initialBalance = "Starting balance must be 0 or greater.";
  } else if (initialBalance > 100_000_000) {
    errors.initialBalance = "Starting balance cannot exceed $100,000,000.";
  }

  const monthlyWithdrawal = parseFloat(form.monthlyWithdrawal.replace(/,/g, "").trim());
  if (isNaN(monthlyWithdrawal) || monthlyWithdrawal <= 0) {
    errors.monthlyWithdrawal = "Monthly withdrawal must be greater than 0.";
  } else if (monthlyWithdrawal > 1_000_000) {
    errors.monthlyWithdrawal = "Monthly withdrawal cannot exceed $1,000,000.";
  }

  const annualReturnRatePct = parseFloat(form.annualReturnRatePct.trim());
  if (isNaN(annualReturnRatePct) || annualReturnRatePct < 0) {
    errors.annualReturnRatePct = "Estimated return must be 0% or greater.";
  } else if (annualReturnRatePct > 50) {
    errors.annualReturnRatePct = "Estimated return cannot exceed 50%.";
  }

  const annualInflationRatePct = parseFloat(form.annualInflationRatePct.trim() || "0");
  if (isNaN(annualInflationRatePct) || annualInflationRatePct < 0) {
    errors.annualInflationRatePct = "Inflation rate must be 0% or greater.";
  } else if (annualInflationRatePct > 30) {
    errors.annualInflationRatePct = "Inflation rate cannot exceed 30%.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid
      ? {
          initialBalance,
          monthlyWithdrawal,
          annualReturnRatePct,
          annualInflationRatePct,
          withdrawalTiming: form.withdrawalTiming,
        }
      : null,
  };
}
