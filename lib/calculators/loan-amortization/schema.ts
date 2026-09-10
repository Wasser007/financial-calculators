export type RepaymentMethod = "fixed-payment" | "equal-principal";

export interface LoanCalculatorInputs {
  loanAmount: number;
  annualInterestRate: number; // 百分比形式，如 5.5 代表 5.5%
  loanTermYears: number;
  repaymentMethod: RepaymentMethod;
  extraMonthlyPayment: number;
}

export interface AmortizationScheduleRow {
  month: number;
  beginningBalance: number;
  principalPayment: number;
  interestPayment: number;
  extraPayment: number;
  totalMonthlyPayment: number;
  endingBalance: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number; // 基础首月还款额
  totalInterestPaid: number;
  totalPayment: number;
  actualMonths: number;
  interestSaved: number;
  monthsSaved: number;
  schedule: AmortizationScheduleRow[];
}

export const DEFAULT_LOAN_INPUTS: LoanCalculatorInputs = {
  loanAmount: 300000,
  annualInterestRate: 6.0,
  loanTermYears: 30,
  repaymentMethod: "fixed-payment",
  extraMonthlyPayment: 0,
};
