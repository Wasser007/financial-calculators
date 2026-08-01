import { describe, expect, it } from 'vitest';
import {
  canonicalNumber,
  decimalPlaces,
  expandExponential,
  formatAmount,
  parseCalculatorQuery,
} from '../../lib/calculator/index.js';

describe('canonical base-10 number handling', () => {
  it.each([
    [1e-7, '0.0000001'],
    [-1e-7, '-0.0000001'],
    [1.23e-7, '0.000000123'],
    [1e21, '1000000000000000000000'],
    [-1.23e21, '-1230000000000000000000'],
  ])('expands %s without rounding', (value, expected) => {
    expect(expandExponential(value)).toBe(expected);
  });

  it('keeps ordinary decimal text unchanged', () => {
    expect(expandExponential(123.45)).toBe('123.45');
  });

  it('counts fractional places after exponent expansion', () => {
    expect(decimalPlaces(1e-7)).toBe(7);
    expect(decimalPlaces(1e21)).toBe(0);
    expect(decimalPlaces(12.34)).toBe(2);
  });

  it('creates canonical serialization text', () => {
    expect(canonicalNumber(-0)).toBe('0');
    expect(canonicalNumber(1e-7)).toBe('0.0000001');
    expect(canonicalNumber(1e21)).toBe('1000000000000000000000');
  });
});

describe('secondary public boundary branches', () => {
  it('accepts URLSearchParams without mutating the caller instance', () => {
    const query = new URLSearchParams('v=1&p=500');
    const parsed = parseCalculatorQuery(query);
    expect(parsed.inputs.initialPrincipal).toBe(500);
    expect(query.toString()).toBe('v=1&p=500');
  });

  it('uses the supplied non-US locale while keeping currency symbol-free', () => {
    expect(
      formatAmount(1234.5, { currency: 'EUR', locale: 'de-DE' }),
    ).toBe('1.234,50');
  });
});
