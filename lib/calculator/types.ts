export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type ContributionFrequency = 'monthly' | 'quarterly' | 'annually';
export type ContributionTiming = 'beginning' | 'end';
export type CompoundingFrequency =
  | 'daily'
  | 'monthly'
  | 'quarterly'
  | 'semi-annually'
  | 'annually';

export interface CalculatorInputs {
  currency: CurrencyCode;
  initialPrincipal: number;
  contributionAmount: number;
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  durationMonths: number;
  nominalAnnualRate: number;
  compoundingFrequency: CompoundingFrequency;
  nominalAnnualFeeRate: number;
  inflationRate: number;
}

export interface MonthlyLedgerEntry {
  month: number;
  year: number;
  monthOfYear: number;
  openingBalance: number;
  beginningContribution: number;
  interestEarned: number;
  feeCharged: number;
  endingContribution: number;
  closingBalance: number;
  cumulativeContributions: number;
  cumulativeGrossGrowth: number;
  cumulativeFees: number;
}

export interface AnnualScheduleEntry {
  year: number;
  startMonth: number;
  endMonth: number;
  openingBalance: number;
  contributions: number;
  grossGrowth: number;
  fees: number;
  closingBalance: number;
  cumulativeContributions: number;
  cumulativeGrossGrowth: number;
  cumulativeFees: number;
}

export interface CalculatorSummary {
  finalBalance: number;
  totalContributions: number;
  grossGrowth: number;
  totalFees: number;
  nominalInvestmentGain: number;
  inflationAdjustedFinalBalance: number;
}

export interface CalculatorResult extends CalculatorSummary {
  monthlyLedger: MonthlyLedgerEntry[];
  annualSchedule: AnnualScheduleEntry[];
}

export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssueCode =
  | 'NOT_FINITE'
  | 'OUT_OF_RANGE'
  | 'TOO_MANY_DECIMALS'
  | 'INTEGER_REQUIRED'
  | 'UNSUPPORTED_ENUM'
  | 'LONG_HORIZON'
  | 'LARGE_AMOUNT'
  | 'HIGH_RETURN_ASSUMPTION'
  | 'HIGH_FEE'
  | 'DEFLATION_ASSUMPTION'
  | 'MISSING_VERSION'
  | 'UNSUPPORTED_VERSION'
  | 'URL_VALUE_IGNORED';

export interface ValidationIssue {
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  field?: keyof CalculatorInputs;
  message: string;
}

export interface ValidationResult {
  inputs: CalculatorInputs;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface EvaluationResult extends ValidationResult {
  result?: CalculatorResult;
}

export interface ParsedCalculatorQuery extends ValidationResult {}

export interface FormatAmountOptions {
  currency: CurrencyCode;
  locale: string;
}
