import type { LoanCalculationResult, LoanCalculatorInputs } from "./schema.js";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface MetricItem {
  label: string;
  value: string;
  subtext?: string | undefined;
  highlight?: boolean | undefined;
}

export function getSummaryMetrics(result: LoanCalculationResult, inputs: LoanCalculatorInputs): MetricItem[] {
  const years = Math.floor(result.actualMonths / 12);
  const remainingMonths = result.actualMonths % 12;
  const payoffTime = remainingMonths > 0 ? `${years} yrs ${remainingMonths} mos` : `${years} years`;

  const metrics: MetricItem[] = [
    {
      label: inputs.repaymentMethod === "fixed-payment" ? "Monthly Payment" : "First Month Payment",
      value: formatCurrencyDetailed(result.monthlyPayment),
      highlight: true,
    },
    {
      label: "Total Interest Paid",
      value: formatCurrency(result.totalInterestPaid),
    },
    {
      label: "Total Cost of Loan",
      value: formatCurrency(result.totalPayment),
      subtext: `Principal: ${formatCurrency(inputs.loanAmount)}`,
    },
    {
      label: "Payoff Time",
      value: payoffTime,
      subtext: result.monthsSaved > 0 ? `Shortened by ${result.monthsSaved} months` : undefined,
    },
  ];

  if (result.interestSaved > 0) {
    metrics.push({
      label: "Interest Saved",
      value: formatCurrency(result.interestSaved),
      subtext: "From extra monthly payments",
      highlight: true,
    });
  }

  return metrics;
}

export const LOAN_FAQ_ITEMS = [
  {
    q: "What is the difference between fixed payment and equal principal?",
    a: "With fixed payment (amortized), your monthly payment remains identical throughout the loan, with interest making up a higher portion early on. With equal principal, you pay a fixed amount toward principal each month plus accrued interest, meaning your payments start higher and decrease over time.",
  },
  {
    q: "How do extra payments reduce overall loan costs?",
    a: "Extra payments are directly subtracted from your remaining principal balance. Because monthly interest is calculated based on the current outstanding balance, lowering principal reduces the interest compounded in every subsequent month and accelerates your debt payoff date.",
  },
  {
    q: "Does this calculation include property taxes and insurance (PITI)?",
    a: "This model specifically calculates principal and interest (P&I) amortization. Homeowners insurance, property taxes, and private mortgage insurance (PMI) vary significantly by jurisdiction and are excluded to maintain clean, transparent math.",
  },
];
