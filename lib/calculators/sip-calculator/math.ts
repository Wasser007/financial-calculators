import type {
  SipCalculatorInputs,
  SipCalculatorResult,
  SipYearlyBreakdown,
} from "./schema.js";

export function calculateSip(inputs: SipCalculatorInputs): SipCalculatorResult {
  const initial = Math.max(0, inputs.initialInvestment || 0);
  const monthly = Math.max(0, inputs.monthlyContribution || 0);
  const annualRate = Math.max(0, inputs.annualReturnRate || 0);
  const years = Math.max(1, Math.min(60, Math.round(inputs.investmentPeriodYears || 1)));

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  const yearlySchedule: SipYearlyBreakdown[] = [];

  let currentTotalInvested = initial;
  let currentFutureValue = initial;

  for (let m = 1; m <= totalMonths; m++) {
    // 产生当月收益 + 月末投入
    currentFutureValue = currentFutureValue * (1 + monthlyRate) + monthly;
    currentTotalInvested += monthly;

    if (m % 12 === 0) {
      const year = m / 12;
      yearlySchedule.push({
        year,
        totalInvested: Math.round(currentTotalInvested),
        futureValue: Math.round(currentFutureValue),
        totalReturns: Math.round(Math.max(0, currentFutureValue - currentTotalInvested)),
      });
    }
  }

  const finalFutureValue = Math.round(currentFutureValue);
  const finalInvested = Math.round(currentTotalInvested);
  const finalReturns = Math.round(Math.max(0, finalFutureValue - finalInvested));

  return {
    totalInvested: finalInvested,
    futureValue: finalFutureValue,
    totalReturns: finalReturns,
    yearlySchedule,
  };
}
