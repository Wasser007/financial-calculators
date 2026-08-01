import { validateInputs } from './validation.js';
import type {
  AnnualScheduleEntry,
  CalculatorInputs,
  CalculatorResult,
  EvaluationResult,
  MonthlyLedgerEntry,
} from './types.js';

const periodsPerYear = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  'semi-annually': 2,
  annually: 1,
} as const;

export class CalculatorValidationError extends Error {
  readonly evaluation: EvaluationResult;

  constructor(evaluation: EvaluationResult) {
    super('Calculator inputs are invalid.');
    this.name = 'CalculatorValidationError';
    this.evaluation = evaluation;
  }
}

function hasContribution(
  monthOfYear: number,
  frequency: CalculatorInputs['contributionFrequency'],
  timing: CalculatorInputs['contributionTiming'],
): boolean {
  if (frequency === 'monthly') {
    return true;
  }
  if (frequency === 'quarterly') {
    return timing === 'beginning'
      ? [1, 4, 7, 10].includes(monthOfYear)
      : [3, 6, 9, 12].includes(monthOfYear);
  }
  return timing === 'beginning' ? monthOfYear === 1 : monthOfYear === 12;
}

function aggregateAnnualSchedule(
  ledger: readonly MonthlyLedgerEntry[],
): AnnualScheduleEntry[] {
  const schedule: AnnualScheduleEntry[] = [];
  for (let offset = 0; offset < ledger.length; offset += 12) {
    const rows = ledger.slice(offset, offset + 12);
    const first = rows[0]!;
    const last = rows.at(-1)!;
    schedule.push({
      year: schedule.length + 1,
      startMonth: first.month,
      endMonth: last.month,
      openingBalance: first.openingBalance,
      contributions: rows.reduce(
        (sum, row) =>
          sum + row.beginningContribution + row.endingContribution,
        0,
      ),
      grossGrowth: rows.reduce((sum, row) => sum + row.interestEarned, 0),
      fees: rows.reduce((sum, row) => sum + row.feeCharged, 0),
      closingBalance: last.closingBalance,
      cumulativeContributions: last.cumulativeContributions,
      cumulativeGrossGrowth: last.cumulativeGrossGrowth,
      cumulativeFees: last.cumulativeFees,
    });
  }
  return schedule;
}

function calculateValidated(inputs: CalculatorInputs): CalculatorResult {
  const n = periodsPerYear[inputs.compoundingFrequency];
  const monthlyReturn = (1 + inputs.nominalAnnualRate / n) ** (n / 12) - 1;
  const monthlyFeeRate = inputs.nominalAnnualFeeRate / 12;
  const ledger: MonthlyLedgerEntry[] = [];

  let balance = inputs.initialPrincipal;
  let cumulativeContributions = 0;
  let cumulativeGrossGrowth = 0;
  let cumulativeFees = 0;

  for (let month = 1; month <= inputs.durationMonths; month += 1) {
    const monthOfYear = ((month - 1) % 12) + 1;
    const contributionDue = hasContribution(
      monthOfYear,
      inputs.contributionFrequency,
      inputs.contributionTiming,
    );
    const beginningContribution =
      contributionDue && inputs.contributionTiming === 'beginning'
        ? inputs.contributionAmount
        : 0;
    const endingContribution =
      contributionDue && inputs.contributionTiming === 'end'
        ? inputs.contributionAmount
        : 0;
    const openingBalance = balance;
    const interestEarned =
      (openingBalance + beginningContribution) * monthlyReturn;
    const balanceAfterInterest =
      openingBalance + beginningContribution + interestEarned;
    const feeCharged = balanceAfterInterest * monthlyFeeRate;
    const closingBalance =
      balanceAfterInterest - feeCharged + endingContribution;

    cumulativeContributions += beginningContribution + endingContribution;
    cumulativeGrossGrowth += interestEarned;
    cumulativeFees += feeCharged;

    ledger.push({
      month,
      year: Math.ceil(month / 12),
      monthOfYear,
      openingBalance,
      beginningContribution,
      interestEarned,
      feeCharged,
      endingContribution,
      closingBalance,
      cumulativeContributions,
      cumulativeGrossGrowth,
      cumulativeFees,
    });
    balance = closingBalance;
  }

  const finalBalance = balance;
  const totalContributions = cumulativeContributions;
  const grossGrowth = cumulativeGrossGrowth;
  const totalFees = cumulativeFees;
  const nominalInvestmentGain = grossGrowth - totalFees;
  const inflationAdjustedFinalBalance =
    finalBalance /
    (1 + inputs.inflationRate) ** (inputs.durationMonths / 12);

  return {
    finalBalance,
    totalContributions,
    grossGrowth,
    totalFees,
    nominalInvestmentGain,
    inflationAdjustedFinalBalance,
    monthlyLedger: ledger,
    annualSchedule: aggregateAnnualSchedule(ledger),
  };
}

export function evaluateCalculator(inputs: CalculatorInputs): EvaluationResult {
  const validation = validateInputs(inputs);
  if (validation.errors.length > 0) {
    return validation;
  }
  return {
    ...validation,
    result: calculateValidated(validation.inputs),
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const evaluation = evaluateCalculator(inputs);
  if (!evaluation.result) {
    throw new CalculatorValidationError(evaluation);
  }
  return evaluation.result;
}
