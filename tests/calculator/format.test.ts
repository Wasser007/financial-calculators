import { describe, expect, it } from 'vitest';
import { formatAmount } from '../../lib/calculator/index.js';

const options = { currency: 'USD' as const, locale: 'en-US' };

describe('Revision 4 en-US amount formatting', () => {
  it.each([
    [0, '0.00'],
    [-0, '0.00'],
    [0.004999, '0.00'],
    [-0.004999, '0.00'],
    [0.005, '0.01'],
    [-0.005, '-0.01'],
    [1.005, '1.01'],
    [-1.005, '-1.01'],
    [1234567.8, '1,234,567.80'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatAmount(value, options)).toBe(expected);
  });

  it('requires a currency but keeps supported currencies display-neutral', () => {
    for (const currency of ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const) {
      expect(formatAmount(1234.5, { currency, locale: 'en-US' })).toBe(
        '1,234.50',
      );
    }
  });

  it('rejects non-finite display values', () => {
    expect(() => formatAmount(Number.NaN, options)).toThrow(RangeError);
    expect(() => formatAmount(Number.POSITIVE_INFINITY, options)).toThrow(
      RangeError,
    );
  });
});
