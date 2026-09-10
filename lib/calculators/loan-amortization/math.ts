import type {
  AmortizationScheduleRow,
  LoanCalculationResult,
  LoanCalculatorInputs,
} from "./schema.js";

function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateAmortizationSchedule(
  inputs: LoanCalculatorInputs,
  includeExtra = true
): { schedule: AmortizationScheduleRow[]; totalInterest: number; totalPaid: number; months: number; firstPayment: number } {
  const { loanAmount, annualInterestRate, loanTermYears, repaymentMethod } = inputs;
  const extraMonthly = includeExtra ? Math.max(0, inputs.extraMonthlyPayment) : 0;
  const monthlyRate = annualInterestRate > 0 ? annualInterestRate / 100 / 12 : 0;
  const totalNominalMonths = Math.max(1, Math.round(loanTermYears * 12));

  let baseMonthlyPayment = 0;
  if (repaymentMethod === "fixed-payment") {
    if (monthlyRate === 0) {
      baseMonthlyPayment = loanAmount / totalNominalMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, totalNominalMonths);
      baseMonthlyPayment = (loanAmount * monthlyRate * compoundFactor) / (compoundFactor - 1);
    }
  }

  const schedule: AmortizationScheduleRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPaid = 0;
  let firstMonthPayment = 0;

  for (let month = 1; month <= totalNominalMonths && balance > 0.005; month++) {
    const beginningBalance = balance;
    const interestForMonth = monthlyRate === 0 ? 0 : roundCurrency(balance * monthlyRate);

    let regularPrincipal = 0;
    if (repaymentMethod === "fixed-payment") {
      regularPrincipal = baseMonthlyPayment - interestForMonth;
    } else {
      regularPrincipal = loanAmount / totalNominalMonths;
    }

    let actualPrincipal = Math.min(balance, regularPrincipal);
    let actualExtra = 0;
    const remainingAfterRegular = balance - actualPrincipal;

    if (remainingAfterRegular > 0 && extraMonthly > 0) {
      actualExtra = Math.min(remainingAfterRegular, extraMonthly);
    }

    let monthTotalPrincipal = actualPrincipal + actualExtra;

    // 最后一期处理：名义最后一期或剩余本金少于常规月供时，彻底结清平账
    const isLastNominalMonth = month === totalNominalMonths;
    if (isLastNominalMonth || balance - monthTotalPrincipal < 1.0) {
      monthTotalPrincipal = balance;
      actualExtra = 0;
      actualPrincipal = balance;
    }

    const totalMonthPayment = roundCurrency(interestForMonth + monthTotalPrincipal);
    balance = Math.max(0, roundCurrency(balance - monthTotalPrincipal));

    if (month === 1) {
      firstMonthPayment = totalMonthPayment;
    }

    totalInterest = roundCurrency(totalInterest + interestForMonth);
    totalPaid = roundCurrency(totalPaid + totalMonthPayment);

    schedule.push({
      month,
      beginningBalance: roundCurrency(beginningBalance),
      principalPayment: roundCurrency(actualPrincipal),
      interestPayment: roundCurrency(interestForMonth),
      extraPayment: roundCurrency(actualExtra),
      totalMonthlyPayment: totalMonthPayment,
      endingBalance: balance,
    });
  }

  return {
    schedule,
    totalInterest: roundCurrency(totalInterest),
    totalPaid: roundCurrency(totalPaid),
    months: schedule.length,
    firstPayment: roundCurrency(firstMonthPayment),
  };
}

export function calculateLoan(inputs: LoanCalculatorInputs): LoanCalculationResult {
  const withExtra = calculateAmortizationSchedule(inputs, true);
  const baseWithoutExtra = calculateAmortizationSchedule(inputs, false);

  const interestSaved = Math.max(0, roundCurrency(baseWithoutExtra.totalInterest - withExtra.totalInterest));
  const monthsSaved = Math.max(0, baseWithoutExtra.months - withExtra.months);

  return {
    monthlyPayment: withExtra.firstPayment,
    totalInterestPaid: withExtra.totalInterest,
    totalPayment: withExtra.totalPaid,
    actualMonths: withExtra.months,
    interestSaved,
    monthsSaved,
    schedule: withExtra.schedule,
  };
}
