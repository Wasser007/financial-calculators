export interface LoanPayoffInput {
  balance: number;
  annualInterestRate: number; // e.g. 5.5 for 5.5%
  monthlyPayment: number;
  extraMonthlyPayment?: number;
}

export interface LoanPayoffResult {
  baselineMonths: number;
  baselineTotalInterest: number;
  baselineTotalPaid: number;
  acceleratedMonths: number;
  acceleratedTotalInterest: number;
  acceleratedTotalPaid: number;
  monthsSaved: number;
  interestSaved: number;
  isPayoffPossible: boolean;
  minPaymentRequired: number;
}

export function calculateLoanPayoff(input: LoanPayoffInput): LoanPayoffResult {
  const { balance, annualInterestRate, monthlyPayment, extraMonthlyPayment = 0 } = input;
  
  const monthlyRate = annualInterestRate / 100 / 12;
  const firstMonthInterest = balance * monthlyRate;
  
  // 必须能覆盖首月利息，否则债务永远无法还清
  if (monthlyPayment <= firstMonthInterest || balance <= 0) {
    return {
      baselineMonths: 0,
      baselineTotalInterest: 0,
      baselineTotalPaid: 0,
      acceleratedMonths: 0,
      acceleratedTotalInterest: 0,
      acceleratedTotalPaid: 0,
      monthsSaved: 0,
      interestSaved: 0,
      isPayoffPossible: false,
      minPaymentRequired: Math.ceil((firstMonthInterest + 1) * 100) / 100,
    };
  }

  function simulatePayoff(principal: number, rate: number, payment: number) {
    let currentBalance = principal;
    let totalInterest = 0;
    let months = 0;
    const MAX_MONTHS = 1200; // 100 years guardrail

    while (currentBalance > 0.005 && months < MAX_MONTHS) {
      months++;
      const interest = currentBalance * rate;
      totalInterest += interest;
      const principalPaid = Math.min(currentBalance, payment - interest);
      currentBalance -= principalPaid;
    }

    return {
      months,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPaid: Math.round((principal + totalInterest) * 100) / 100,
    };
  }

  const baseline = simulatePayoff(balance, monthlyRate, monthlyPayment);
  const accelerated = simulatePayoff(balance, monthlyRate, monthlyPayment + Math.max(0, extraMonthlyPayment));

  return {
    baselineMonths: baseline.months,
    baselineTotalInterest: baseline.totalInterest,
    baselineTotalPaid: baseline.totalPaid,
    acceleratedMonths: accelerated.months,
    acceleratedTotalInterest: accelerated.totalInterest,
    acceleratedTotalPaid: accelerated.totalPaid,
    monthsSaved: Math.max(0, baseline.months - accelerated.months),
    interestSaved: Math.max(0, Math.round((baseline.totalInterest - accelerated.totalInterest) * 100) / 100),
    isPayoffPossible: true,
    minPaymentRequired: Math.ceil((firstMonthInterest + 1) * 100) / 100,
  };
}
