export interface SipCalculatorInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number;
  investmentPeriodYears: number;
}

export interface SipYearlyBreakdown {
  year: number;
  totalInvested: number;
  futureValue: number;
  totalReturns: number;
}

export interface SipCalculatorResult {
  totalInvested: number;
  futureValue: number;
  totalReturns: number;
  yearlySchedule: SipYearlyBreakdown[];
}

export const DEFAULT_SIP_INPUTS: SipCalculatorInputs = {
  initialInvestment: 1000,
  monthlyContribution: 500,
  annualReturnRate: 8.0,
  investmentPeriodYears: 10,
};
