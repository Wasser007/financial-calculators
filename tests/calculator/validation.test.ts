import { describe, expect, it } from 'vitest';
import {
  CalculatorValidationError,
  DEFAULT_INPUTS,
  calculate,
  validateInputs,
  type CalculatorInputs,
} from '../../lib/calculator/index.js';

const invalidCases: readonly [
  string,
  keyof CalculatorInputs,
  unknown,
  string,
][] = [
  ['I01', 'initialPrincipal', -0.01, 'OUT_OF_RANGE'],
  ['I02', 'initialPrincipal', 1_000_000_000.01, 'OUT_OF_RANGE'],
  ['I03', 'contributionAmount', 0.001, 'TOO_MANY_DECIMALS'],
  ['I04', 'durationMonths', 12.5, 'INTEGER_REQUIRED'],
  ['I05', 'durationMonths', 0, 'OUT_OF_RANGE'],
  ['I06', 'durationMonths', 1201, 'OUT_OF_RANGE'],
  ['I07', 'nominalAnnualRate', -1, 'OUT_OF_RANGE'],
  ['I08', 'nominalAnnualRate', 0.07001, 'TOO_MANY_DECIMALS'],
  ['I09', 'inflationRate', -1, 'OUT_OF_RANGE'],
  ['I10', 'nominalAnnualFeeRate', -0.0001, 'OUT_OF_RANGE'],
  ['I11', 'currency', 'CNY', 'UNSUPPORTED_ENUM'],
  ['I12', 'contributionFrequency', 'weekly', 'UNSUPPORTED_ENUM'],
  ['I13', 'contributionTiming', 'middle', 'UNSUPPORTED_ENUM'],
  ['I14', 'compoundingFrequency', 'continuous', 'UNSUPPORTED_ENUM'],
  ['I15', 'initialPrincipal', Number.NaN, 'NOT_FINITE'],
  ['I16', 'initialPrincipal', Number.POSITIVE_INFINITY, 'NOT_FINITE'],
];

describe('I01–I16 direct input validation', () => {
  for (const [id, field, replacement, code] of invalidCases) {
    it(`${id} returns exactly ${code} for ${field}`, () => {
      const inputs = {
        ...DEFAULT_INPUTS,
        [field]: replacement,
      } as CalculatorInputs;
      const validation = validateInputs(inputs);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toMatchObject({
        code,
        severity: 'error',
        field,
      });
      expect(validation.warnings).toEqual([]);
      expect(() => calculate(inputs)).toThrow(CalculatorValidationError);
    });
  }
});

describe('validation precedence, order and normalization', () => {
  it('returns one error per field in CalculatorInputs order', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUTS,
      currency: 'CNY' as CalculatorInputs['currency'],
      initialPrincipal: Number.NaN,
      contributionAmount: -1,
      contributionFrequency:
        'weekly' as CalculatorInputs['contributionFrequency'],
      contributionTiming: 'middle' as CalculatorInputs['contributionTiming'],
      durationMonths: 12.5,
      nominalAnnualRate: 2.0001,
      compoundingFrequency:
        'continuous' as CalculatorInputs['compoundingFrequency'],
      nominalAnnualFeeRate: 0.2001,
      inflationRate: 0.5001,
    });
    expect(validation.errors.map((issue) => issue.field)).toEqual([
      'currency',
      'initialPrincipal',
      'contributionAmount',
      'contributionFrequency',
      'contributionTiming',
      'durationMonths',
      'nominalAnnualRate',
      'compoundingFrequency',
      'nominalAnnualFeeRate',
      'inflationRate',
    ]);
    expect(validation.errors[5]!.code).toBe('INTEGER_REQUIRED');
  });

  it('judges decimal precision from the supplied JavaScript number', () => {
    expect(
      validateInputs({
        ...DEFAULT_INPUTS,
        contributionAmount: 0.1 + 0.2,
      }).errors[0],
    ).toMatchObject({
      code: 'TOO_MANY_DECIMALS',
      field: 'contributionAmount',
    });
  });

  it('normalizes negative zero and emits ordered assumption warnings', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUTS,
      initialPrincipal: -0,
      contributionAmount: 10_000_000.01,
      durationMonths: 601,
      nominalAnnualRate: 0.5001,
      nominalAnnualFeeRate: 0.0501,
      inflationRate: -0.0001,
    });
    expect(Object.is(validation.inputs.initialPrincipal, -0)).toBe(false);
    expect(validation.warnings.map((issue) => issue.code)).toEqual([
      'LONG_HORIZON',
      'LARGE_AMOUNT',
      'HIGH_RETURN_ASSUMPTION',
      'HIGH_FEE',
      'DEFLATION_ASSUMPTION',
    ]);
    expect(validation.warnings[1]!.field).toBe('contributionAmount');
  });

  it('implements I24 as a valid long-horizon calculation', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUTS,
      durationMonths: 601,
    });
    expect(validation.errors).toEqual([]);
    expect(validation.warnings).toHaveLength(1);
    expect(validation.warnings[0]).toMatchObject({
      code: 'LONG_HORIZON',
      field: 'durationMonths',
    });
  });
});
