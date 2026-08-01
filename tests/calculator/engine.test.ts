import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  calculate,
  evaluateCalculator,
  formatAmount,
  type CalculatorResult,
} from '../../lib/calculator/index.js';
import { referenceCalculate } from './reference.js';
import { validVectors } from './valid-vectors.js';

const summaryFields = [
  'finalBalance',
  'totalContributions',
  'grossGrowth',
  'totalFees',
  'nominalInvestmentGain',
  'inflationAdjustedFinalBalance',
] as const;

function tolerance(actual: number, expected: number): number {
  return Math.max(
    1e-9,
    1e-12 * Math.max(1, Math.abs(actual), Math.abs(expected)),
  );
}

function expectClose(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
    tolerance(actual, expected),
  );
}

function compareNumericRecords(
  actual: Record<string, number>,
  expected: Record<string, number>,
): void {
  expect(Object.keys(actual)).toEqual(Object.keys(expected));
  for (const key of Object.keys(expected)) {
    expectClose(actual[key]!, expected[key]!);
  }
}

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function allNumbersFinite(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(allNumbersFinite);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).every(allNumbersFinite);
  }
  return true;
}

function checkIdentities(result: CalculatorResult, principal: number): void {
  for (const row of result.monthlyLedger) {
    expectClose(
      row.closingBalance,
      row.openingBalance +
        row.beginningContribution +
        row.interestEarned -
        row.feeCharged +
        row.endingContribution,
    );
  }
  for (const row of result.annualSchedule) {
    expectClose(
      row.closingBalance,
      row.openingBalance + row.contributions + row.grossGrowth - row.fees,
    );
  }
  expectClose(
    result.finalBalance,
    principal +
      result.totalContributions +
      result.grossGrowth -
      result.totalFees,
  );
  expectClose(
    result.nominalInvestmentGain,
    result.grossGrowth - result.totalFees,
  );
}

describe('Revision 4 V01–V12', () => {
  for (const vector of validVectors) {
    it(`${vector.id} matches frozen summaries, displays, ledgers and schedules`, () => {
      const actual = calculate(vector.inputs);
      const reference = referenceCalculate(vector.inputs);

      for (const field of summaryFields) {
        expectClose(actual[field], vector.expectedRaw[field]);
        expect(formatAmount(actual[field], {
          currency: vector.inputs.currency,
          locale: 'en-US',
        })).toBe(vector.expectedDisplay[field]);
      }

      expect(actual.monthlyLedger).toHaveLength(vector.inputs.durationMonths);
      expect(actual.annualSchedule).toHaveLength(
        Math.ceil(vector.inputs.durationMonths / 12),
      );
      actual.monthlyLedger.forEach((row, index) => {
        compareNumericRecords(
          row as unknown as Record<string, number>,
          reference.monthlyLedger[index] as unknown as Record<string, number>,
        );
      });
      actual.annualSchedule.forEach((row, index) => {
        compareNumericRecords(
          row as unknown as Record<string, number>,
          reference.annualSchedule[index] as unknown as Record<string, number>,
        );
      });

      expect(hash(actual.monthlyLedger)).toBe(vector.ledgerSha256);
      expect(hash(actual.annualSchedule)).toBe(vector.annualSha256);
      expect(allNumbersFinite(actual)).toBe(true);
      checkIdentities(actual, vector.inputs.initialPrincipal);
    });
  }

  it('preserves negative growth and omits annual/end deposits before month 12', () => {
    const v06 = calculate(validVectors[5]!.inputs);
    expect(v06.grossGrowth).toBeLessThan(0);
    expect(v06.nominalInvestmentGain).toBeLessThan(0);
    expect(calculate(validVectors[7]!.inputs).totalContributions).toBe(0);
    expect(calculate(validVectors[11]!.inputs).totalContributions).toBe(0);
  });

  it('returns V11 warnings in the frozen order', () => {
    const evaluation = evaluateCalculator(validVectors[10]!.inputs);
    expect(evaluation.errors).toEqual([]);
    expect(evaluation.warnings.map((issue) => issue.code)).toEqual([
      'HIGH_RETURN_ASSUMPTION',
      'HIGH_FEE',
    ]);
  });
});

describe('S01 stress vector', () => {
  it('calculates 100 years without non-finite output', () => {
    const evaluation = evaluateCalculator({
      currency: 'USD',
      initialPrincipal: 1_000_000_000,
      contributionAmount: 100_000_000,
      contributionFrequency: 'monthly',
      contributionTiming: 'end',
      durationMonths: 1200,
      nominalAnnualRate: 0,
      compoundingFrequency: 'monthly',
      nominalAnnualFeeRate: 0,
      inflationRate: 0,
    });
    expect(evaluation.errors).toEqual([]);
    expect(evaluation.warnings.map((issue) => [issue.code, issue.field])).toEqual([
      ['LONG_HORIZON', 'durationMonths'],
      ['LARGE_AMOUNT', undefined],
    ]);
    const result = evaluation.result!;
    expect(result.finalBalance).toBe(121_000_000_000);
    expect(result.totalContributions).toBe(120_000_000_000);
    expect(result.grossGrowth).toBe(0);
    expect(result.totalFees).toBe(0);
    expect(result.nominalInvestmentGain).toBe(0);
    expect(result.inflationAdjustedFinalBalance).toBe(121_000_000_000);
    expect(result.monthlyLedger).toHaveLength(1200);
    expect(result.annualSchedule).toHaveLength(100);
    expect(allNumbersFinite(result)).toBe(true);
  });
});
