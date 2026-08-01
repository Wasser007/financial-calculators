import type {
  AnnualScheduleEntry,
  CalculatorInputs,
  CalculatorResult,
  MonthlyLedgerEntry,
} from '../../lib/calculator/types.js';

function buildDepositSets(input: CalculatorInputs): {
  starts: ReadonlySet<number>;
  ends: ReadonlySet<number>;
} {
  const starts = new Set<number>();
  const ends = new Set<number>();
  for (let month = 1; month <= input.durationMonths; month += 1) {
    const slot = ((month - 1) % 12) + 1;
    const due =
      input.contributionFrequency === 'monthly' ||
      (input.contributionFrequency === 'quarterly' &&
        (input.contributionTiming === 'beginning'
          ? [1, 4, 7, 10]
          : [3, 6, 9, 12]
        ).includes(slot)) ||
      (input.contributionFrequency === 'annually' &&
        slot === (input.contributionTiming === 'beginning' ? 1 : 12));
    if (due) {
      (input.contributionTiming === 'beginning' ? starts : ends).add(month);
    }
  }
  return { starts, ends };
}

function independentMonthlyYield(input: CalculatorInputs): number {
  let periods: number;
  switch (input.compoundingFrequency) {
    case 'daily':
      periods = 365;
      break;
    case 'monthly':
      periods = 12;
      break;
    case 'quarterly':
      periods = 4;
      break;
    case 'semi-annually':
      periods = 2;
      break;
    case 'annually':
      periods = 1;
      break;
  }
  return (1 + input.nominalAnnualRate / periods) ** (periods / 12) - 1;
}

export function referenceCalculate(input: CalculatorInputs): CalculatorResult {
  const deposits = buildDepositSets(input);
  const monthlyYield = independentMonthlyYield(input);
  const feeFraction = input.nominalAnnualFeeRate / 12;
  const state = {
    account: Number(input.initialPrincipal),
    contributed: 0,
    growth: 0,
    fees: 0,
  };

  const rows = Array.from(
    { length: input.durationMonths },
    (_, index): MonthlyLedgerEntry => {
      const month = index + 1;
      const openingBalance = state.account;
      const beginningContribution = deposits.starts.has(month)
        ? input.contributionAmount
        : 0;
      const interestEarned =
        (openingBalance + beginningContribution) * monthlyYield;
      const feeCharged =
        (openingBalance + beginningContribution + interestEarned) * feeFraction;
      const endingContribution = deposits.ends.has(month)
        ? input.contributionAmount
        : 0;
      state.account =
        openingBalance +
        beginningContribution +
        interestEarned -
        feeCharged +
        endingContribution;
      state.contributed += beginningContribution + endingContribution;
      state.growth += interestEarned;
      state.fees += feeCharged;
      return {
        month,
        year: Math.ceil(month / 12),
        monthOfYear: ((month - 1) % 12) + 1,
        openingBalance,
        beginningContribution,
        interestEarned,
        feeCharged,
        endingContribution,
        closingBalance: state.account,
        cumulativeContributions: state.contributed,
        cumulativeGrossGrowth: state.growth,
        cumulativeFees: state.fees,
      };
    },
  );

  const years: AnnualScheduleEntry[] = [];
  for (let offset = 0; offset < rows.length; offset += 12) {
    const slice = rows.slice(offset, offset + 12);
    const first = slice[0]!;
    const last = slice.at(-1)!;
    years.push({
      year: years.length + 1,
      startMonth: first.month,
      endMonth: last.month,
      openingBalance: first.openingBalance,
      contributions: slice.reduce(
        (sum, row) =>
          sum + row.beginningContribution + row.endingContribution,
        0,
      ),
      grossGrowth: slice.reduce((sum, row) => sum + row.interestEarned, 0),
      fees: slice.reduce((sum, row) => sum + row.feeCharged, 0),
      closingBalance: last.closingBalance,
      cumulativeContributions: last.cumulativeContributions,
      cumulativeGrossGrowth: last.cumulativeGrossGrowth,
      cumulativeFees: last.cumulativeFees,
    });
  }

  return {
    finalBalance: state.account,
    totalContributions: state.contributed,
    grossGrowth: state.growth,
    totalFees: state.fees,
    nominalInvestmentGain: state.growth - state.fees,
    inflationAdjustedFinalBalance:
      state.account /
      (1 + input.inflationRate) ** (input.durationMonths / 12),
    monthlyLedger: rows,
    annualSchedule: years,
  };
}
