import { DEFAULT_INPUTS } from './defaults.js';
import {
  canonicalNumber,
  normalizeNegativeZero,
} from './numbers.js';
import { validateInputs } from './validation.js';
import type {
  CalculatorInputs,
  ParsedCalculatorQuery,
  ValidationIssue,
} from './types.js';

const BUSINESS_KEYS = [
  'cur',
  'p',
  'c',
  'cf',
  'ct',
  'm',
  'r',
  'cmp',
  'f',
  'i',
] as const;

type BusinessKey = (typeof BUSINESS_KEYS)[number];

const keyToField: Record<BusinessKey, keyof CalculatorInputs> = {
  cur: 'currency',
  p: 'initialPrincipal',
  c: 'contributionAmount',
  cf: 'contributionFrequency',
  ct: 'contributionTiming',
  m: 'durationMonths',
  r: 'nominalAnnualRate',
  cmp: 'compoundingFrequency',
  f: 'nominalAnnualFeeRate',
  i: 'inflationRate',
};

const numericKeys = new Set<BusinessKey>(['p', 'c', 'm', 'r', 'f', 'i']);
const strictDecimal = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function urlWarning(
  code: 'MISSING_VERSION' | 'UNSUPPORTED_VERSION' | 'URL_VALUE_IGNORED',
  field?: keyof CalculatorInputs,
): ValidationIssue {
  return {
    code,
    severity: 'warning',
    ...(field === undefined ? {} : { field }),
    message: `Query parameter warning: ${code}.`,
  };
}

function getSearchParams(query: string | URLSearchParams): URLSearchParams {
  if (query instanceof URLSearchParams) {
    return new URLSearchParams(query);
  }
  return new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
}

function getLast(params: URLSearchParams, key: string): string | null {
  const values = params.getAll(key);
  return values.length === 0 ? null : values.at(-1)!;
}

export function parseCalculatorQuery(
  query: string | URLSearchParams,
): ParsedCalculatorQuery {
  const params = getSearchParams(query);
  const recognizedPresent = BUSINESS_KEYS.some((key) => params.has(key));
  if (!recognizedPresent) {
    return { inputs: { ...DEFAULT_INPUTS }, errors: [], warnings: [] };
  }

  const version = getLast(params, 'v');
  if (version === null) {
    return {
      inputs: { ...DEFAULT_INPUTS },
      errors: [],
      warnings: [urlWarning('MISSING_VERSION')],
    };
  }
  if (version !== '1') {
    return {
      inputs: { ...DEFAULT_INPUTS },
      errors: [],
      warnings: [urlWarning('UNSUPPORTED_VERSION')],
    };
  }

  const inputs = { ...DEFAULT_INPUTS } as CalculatorInputs;
  const ignored: ValidationIssue[] = [];

  for (const key of BUSINESS_KEYS) {
    if (!params.has(key)) {
      continue;
    }
    const field = keyToField[key];
    const token = getLast(params, key)!;
    let candidate: string | number;

    if (numericKeys.has(key)) {
      if (!strictDecimal.test(token)) {
        ignored.push(urlWarning('URL_VALUE_IGNORED', field));
        continue;
      }
      candidate = normalizeNegativeZero(Number(token));
    } else {
      candidate = token;
    }

    const oneField = {
      ...DEFAULT_INPUTS,
      [field]: candidate,
    } as unknown as CalculatorInputs;
    const issueForField = validateInputs(oneField).errors.find(
      (issue) => issue.field === field,
    );
    if (issueForField) {
      ignored.push(urlWarning('URL_VALUE_IGNORED', field));
      continue;
    }
    Object.assign(inputs, { [field]: candidate });
  }

  return { inputs, errors: [], warnings: ignored };
}

export function serializeCalculatorQuery(inputs: CalculatorInputs): string {
  const normalized = {
    ...inputs,
    initialPrincipal: normalizeNegativeZero(inputs.initialPrincipal),
    contributionAmount: normalizeNegativeZero(inputs.contributionAmount),
    durationMonths: normalizeNegativeZero(inputs.durationMonths),
    nominalAnnualRate: normalizeNegativeZero(inputs.nominalAnnualRate),
    nominalAnnualFeeRate: normalizeNegativeZero(inputs.nominalAnnualFeeRate),
    inflationRate: normalizeNegativeZero(inputs.inflationRate),
  };

  const changed = BUSINESS_KEYS.filter((key) => {
    const field = keyToField[key];
    return normalized[field] !== DEFAULT_INPUTS[field];
  });
  if (changed.length === 0) {
    return '';
  }

  const params: string[] = ['v=1'];
  for (const key of changed) {
    const field = keyToField[key];
    const value = normalized[field];
    const serialized =
      typeof value === 'number' ? canonicalNumber(value) : value;
    params.push(`${key}=${encodeURIComponent(serialized)}`);
  }
  return `?${params.join('&')}`;
}
