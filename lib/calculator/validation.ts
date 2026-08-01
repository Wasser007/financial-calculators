import { decimalPlaces, normalizeNegativeZero } from './numbers.js';
import type {
  CalculatorInputs,
  ValidationIssue,
  ValidationResult,
} from './types.js';

const currencies = new Set(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);
const contributionFrequencies = new Set(['monthly', 'quarterly', 'annually']);
const contributionTimings = new Set(['beginning', 'end']);
const compoundingFrequencies = new Set([
  'daily',
  'monthly',
  'quarterly',
  'semi-annually',
  'annually',
]);

type NumericField = Exclude<
  keyof CalculatorInputs,
  | 'currency'
  | 'contributionFrequency'
  | 'contributionTiming'
  | 'compoundingFrequency'
>;

interface NumericRule {
  field: NumericField;
  minimum: number;
  maximum: number;
  decimals: number;
  integer?: boolean;
}

const numericRules: readonly NumericRule[] = [
  { field: 'initialPrincipal', minimum: 0, maximum: 1_000_000_000, decimals: 2 },
  {
    field: 'contributionAmount',
    minimum: 0,
    maximum: 100_000_000,
    decimals: 2,
  },
  {
    field: 'durationMonths',
    minimum: 1,
    maximum: 1200,
    decimals: 0,
    integer: true,
  },
  {
    field: 'nominalAnnualRate',
    minimum: -0.9999,
    maximum: 2,
    decimals: 4,
  },
  {
    field: 'nominalAnnualFeeRate',
    minimum: 0,
    maximum: 0.2,
    decimals: 4,
  },
  {
    field: 'inflationRate',
    minimum: -0.9999,
    maximum: 0.5,
    decimals: 4,
  },
];

function error(
  code: ValidationIssue['code'],
  field: keyof CalculatorInputs,
): ValidationIssue {
  return {
    code,
    severity: 'error',
    field,
    message: `${field} failed validation: ${code}.`,
  };
}

function warning(
  code: ValidationIssue['code'],
  field?: keyof CalculatorInputs,
): ValidationIssue {
  return {
    code,
    severity: 'warning',
    ...(field === undefined ? {} : { field }),
    message: `Review assumption: ${code}.`,
  };
}

export function normalizeInputs(inputs: CalculatorInputs): CalculatorInputs {
  return {
    ...inputs,
    initialPrincipal: normalizeNegativeZero(inputs.initialPrincipal),
    contributionAmount: normalizeNegativeZero(inputs.contributionAmount),
    durationMonths: normalizeNegativeZero(inputs.durationMonths),
    nominalAnnualRate: normalizeNegativeZero(inputs.nominalAnnualRate),
    nominalAnnualFeeRate: normalizeNegativeZero(inputs.nominalAnnualFeeRate),
    inflationRate: normalizeNegativeZero(inputs.inflationRate),
  };
}

export function collectAssumptionWarnings(
  inputs: CalculatorInputs,
): ValidationIssue[] {
  const warnings: ValidationIssue[] = [];
  if (inputs.durationMonths > 600) {
    warnings.push(warning('LONG_HORIZON', 'durationMonths'));
  }

  const principalLarge = inputs.initialPrincipal > 100_000_000;
  const contributionLarge = inputs.contributionAmount > 10_000_000;
  if (principalLarge || contributionLarge) {
    const field =
      principalLarge && contributionLarge
        ? undefined
        : principalLarge
          ? 'initialPrincipal'
          : 'contributionAmount';
    warnings.push(warning('LARGE_AMOUNT', field));
  }
  if (inputs.nominalAnnualRate > 0.5) {
    warnings.push(warning('HIGH_RETURN_ASSUMPTION', 'nominalAnnualRate'));
  }
  if (inputs.nominalAnnualFeeRate > 0.05) {
    warnings.push(warning('HIGH_FEE', 'nominalAnnualFeeRate'));
  }
  if (inputs.inflationRate < 0) {
    warnings.push(warning('DEFLATION_ASSUMPTION', 'inflationRate'));
  }
  return warnings;
}

export function validateInputs(inputs: CalculatorInputs): ValidationResult {
  const normalized = normalizeInputs(inputs);
  const errors: ValidationIssue[] = [];

  if (!currencies.has(normalized.currency)) {
    errors.push(error('UNSUPPORTED_ENUM', 'currency'));
  }

  for (const rule of numericRules.slice(0, 2)) {
    validateNumericField(normalized, rule, errors);
  }

  if (!contributionFrequencies.has(normalized.contributionFrequency)) {
    errors.push(error('UNSUPPORTED_ENUM', 'contributionFrequency'));
  }
  if (!contributionTimings.has(normalized.contributionTiming)) {
    errors.push(error('UNSUPPORTED_ENUM', 'contributionTiming'));
  }

  validateNumericField(normalized, numericRules[2]!, errors);
  validateNumericField(normalized, numericRules[3]!, errors);

  if (!compoundingFrequencies.has(normalized.compoundingFrequency)) {
    errors.push(error('UNSUPPORTED_ENUM', 'compoundingFrequency'));
  }

  validateNumericField(normalized, numericRules[4]!, errors);
  validateNumericField(normalized, numericRules[5]!, errors);

  return {
    inputs: normalized,
    errors,
    warnings: errors.length === 0 ? collectAssumptionWarnings(normalized) : [],
  };
}

function validateNumericField(
  inputs: CalculatorInputs,
  rule: NumericRule,
  errors: ValidationIssue[],
): void {
  const value = inputs[rule.field];
  if (!Number.isFinite(value)) {
    errors.push(error('NOT_FINITE', rule.field));
    return;
  }
  if (rule.integer && !Number.isInteger(value)) {
    errors.push(error('INTEGER_REQUIRED', rule.field));
    return;
  }
  if (value < rule.minimum || value > rule.maximum) {
    errors.push(error('OUT_OF_RANGE', rule.field));
    return;
  }
  if (decimalPlaces(value) > rule.decimals) {
    errors.push(error('TOO_MANY_DECIMALS', rule.field));
  }
}
