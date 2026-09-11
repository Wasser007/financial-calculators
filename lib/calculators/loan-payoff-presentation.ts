import { calculateLoanPayoff, type LoanPayoffInput, type LoanPayoffResult } from "./loan-payoff-math.js";

export interface LoanPayoffPresentationModel {
  result: LoanPayoffResult;
  formattedMetrics: {
    baselineTime: string;
    acceleratedTime: string;
    timeSaved: string;
    interestSaved: string;
    totalInterestBaseline: string;
    totalInterestAccelerated: string;
  };
  isValid: boolean;
  statusMessage: string;
}

function formatDuration(months: number): string {
  if (months <= 0) return "0 mo";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) return `${y} yr ${m} mo`;
  if (y > 0) return `${y} yr`;
  return `${m} mo`;
}

export function buildLoanPayoffPresentation(
  input: LoanPayoffInput,
  formatCurrency: (val: number) => string
): LoanPayoffPresentationModel {
  const result = calculateLoanPayoff(input);

  if (!result.isPayoffPossible) {
    return {
      result,
      formattedMetrics: {
        baselineTime: "N/A",
        acceleratedTime: "N/A",
        timeSaved: "0 mo",
        interestSaved: formatCurrency(0),
        totalInterestBaseline: "N/A",
        totalInterestAccelerated: "N/A",
      },
      isValid: false,
      statusMessage: `Monthly payment must exceed monthly interest (${formatCurrency(result.minPaymentRequired)}).`,
    };
  }

  return {
    result,
    formattedMetrics: {
      baselineTime: formatDuration(result.baselineMonths),
      acceleratedTime: formatDuration(result.acceleratedMonths),
      timeSaved: formatDuration(result.monthsSaved),
      interestSaved: formatCurrency(result.interestSaved),
      totalInterestBaseline: formatCurrency(result.baselineTotalInterest),
      totalInterestAccelerated: formatCurrency(result.acceleratedTotalInterest),
    },
    isValid: true,
    statusMessage: `Payoff in ${formatDuration(result.acceleratedMonths)} with extra payments.`,
  };
}
